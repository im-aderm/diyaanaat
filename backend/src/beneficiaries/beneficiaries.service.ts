import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, Logger, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterBeneficiaryDto, ApproveBeneficiaryDto,
  RejectBeneficiaryDto,
} from './dto/beneficiary.dto';
import { SmsService } from '../sms/sms.service';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BeneficiariesService {
  private readonly logger = new Logger(BeneficiariesService.name);

  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    centerId?: string;
    sessionId?: string;
    search?: string;
    stateId?: string;
    distributionDay?: string;
  }) {
    const { skip = 0, take = 20, status, centerId, sessionId, search, stateId, distributionDay } = params;
    const where: Prisma.BeneficiaryWhereInput = {};

    if (status) where.status = status as any;
    if (centerId) where.centerId = centerId;
    if (sessionId) where.sessionId = sessionId;
    if (stateId) where.stateId = stateId;
    if (distributionDay) where.distributionDay = distributionDay as any;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { uniqueCode: { contains: search } },
        { organizationName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.beneficiary.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          center: { select: { id: true, name: true, code: true } },
          state: { select: { id: true, name: true } },
          lga: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.beneficiary.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async findById(id: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id },
      include: {
        center: true,
        state: true,
        lga: true,
        session: true,
        approvedBy: { select: { id: true, fullName: true } },
        documents: true,
        distributions: true,
      },
    });
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    return beneficiary;
  }

  async findByCode(code: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { uniqueCode: code },
      include: {
        center: true,
        state: true,
        session: true,
        distributions: true,
      },
    });
    if (!beneficiary) throw new NotFoundException('Invalid code');
    return beneficiary;
  }

  async register(dto: RegisterBeneficiaryDto) {
    const activeSession = await this.prisma.session.findFirst({
      where: { status: 'REGISTRATION_OPEN' },
    });
    if (!activeSession) throw new BadRequestException('Registration is not currently open');

    const center = await this.prisma.centerState.findFirst({
      where: { stateId: dto.stateId },
      include: { center: true },
    });
    if (!center) throw new BadRequestException('No center available for this state');

    if (dto.type === 'INDIVIDUAL') {
      const existing = await this.prisma.beneficiary.findFirst({
        where: {
          phoneNumber: dto.phoneNumber,
          sessionId: activeSession.id,
        },
      });
      if (existing) throw new ConflictException('This phone number is already registered for this session');
    }

    if (dto.type === 'ORGANIZATION' && dto.organizationName) {
      const existing = await this.prisma.beneficiary.findFirst({
        where: {
          organizationName: dto.organizationName,
          sessionId: activeSession.id,
        },
      });
      if (existing) throw new ConflictException('This organization is already registered for this session');
    }

    const code = await this.generateCodeWithRetry(center.center.code, activeSession.gregorianYear);

    const beneficiary = await this.prisma.beneficiary.create({
      data: {
        sessionId: activeSession.id,
        centerId: center.centerId,
        type: dto.type,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        stateId: dto.stateId,
        lgaId: dto.lgaId,
        vulnerabilityCategory: dto.vulnerabilityCategory,
        organizationType: dto.organizationType,
        organizationName: dto.organizationName,
        guarantorName: dto.guarantorName,
        guarantorPhone: dto.guarantorPhone,
        requestedSlots: dto.requestedSlots,
        isFirstTime: dto.isFirstTime !== false,
        uniqueCode: code,
      },
    });

    try {
      await this.smsService.sendRegistrationConfirmation(beneficiary);
    } catch (err) {
      this.logger.warn(`Failed to send SMS for beneficiary ${beneficiary.id}: ${err}`);
    }

    return beneficiary;
  }

  async approve(id: string, dto: ApproveBeneficiaryDto, userId: string) {
    const beneficiary = await this.findById(id);

    if (beneficiary.status !== 'PENDING') {
      throw new BadRequestException('Only pending beneficiaries can be approved');
    }

    await this.verifyCenterAccess(userId, beneficiary.centerId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.beneficiary.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedSlots: dto.approvedSlots,
          distributionDay: dto.distributionDay,
          distributionTime: dto.distributionTime,
          approvedById: userId,
          approvedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'APPROVE',
          entityType: 'Beneficiary',
          entityId: id,
          sessionId: beneficiary.sessionId,
          centerId: beneficiary.centerId,
        },
      });

      return result;
    });

    try {
      await this.smsService.sendApprovalNotification(updated);
    } catch (err) {
      this.logger.warn(`Failed to send SMS for beneficiary ${id}: ${err}`);
    }

    return updated;
  }

  async reject(id: string, dto: RejectBeneficiaryDto, userId: string) {
    const beneficiary = await this.findById(id);

    if (beneficiary.status !== 'PENDING') {
      throw new BadRequestException('Only pending beneficiaries can be rejected');
    }

    await this.verifyCenterAccess(userId, beneficiary.centerId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.beneficiary.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: dto.rejectionReason,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'REJECT',
          entityType: 'Beneficiary',
          entityId: id,
          sessionId: beneficiary.sessionId,
          centerId: beneficiary.centerId,
          newValue: dto.rejectionReason,
        },
      });

      return result;
    });

    try {
      await this.smsService.sendRejectionNotification(updated);
    } catch (err) {
      this.logger.warn(`Failed to send SMS for beneficiary ${id}: ${err}`);
    }

    return updated;
  }

  async updateSlots(id: string, approvedSlots: number, userId: string) {
    const beneficiary = await this.findById(id);
    const oldSlots = beneficiary.approvedSlots;

    await this.verifyCenterAccess(userId, beneficiary.centerId);

    const updated = await this.prisma.beneficiary.update({
      where: { id },
      data: { approvedSlots },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'UPDATE_SLOTS',
        entityType: 'Beneficiary',
        entityId: id,
        sessionId: beneficiary.sessionId,
        centerId: beneficiary.centerId,
        oldValue: String(oldSlots),
        newValue: String(approvedSlots),
      },
    });

    return updated;
  }

  private generateCode(centerCode: string, year: number): string {
    const shortYear = String(year).slice(-2);
    const random = uuidv4().slice(0, 5).toUpperCase();
    return `APP-${shortYear}-${centerCode}-${random}`;
  }

  private async generateCodeWithRetry(centerCode: string, year: number): Promise<string> {
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const code = this.generateCode(centerCode, year);
      try {
        const existing = await this.prisma.beneficiary.findUnique({ where: { uniqueCode: code } });
        if (!existing) return code;
      } catch {
        if (attempt === maxRetries - 1) throw new BadRequestException('Failed to generate unique code');
      }
    }
    throw new BadRequestException('Failed to generate unique code after retries');
  }

  private async verifyCenterAccess(userId: string, centerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role === 'SUPER_ADMIN') return;

    const userCenter = await this.prisma.userCenter.findFirst({
      where: { userId, centerId },
    });
    if (!userCenter) {
      throw new ForbiddenException('You do not have access to this center');
    }
  }
}
