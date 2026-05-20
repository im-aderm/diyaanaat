import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DistributionService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async verifyCode(code: string, userId: string, ipAddress?: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { uniqueCode: code },
      include: { session: true, center: true, lga: true, state: true },
    });

    if (!beneficiary) {
      await this.auditService.log(userId, 'CODE_VERIFY_FAIL', 'Distribution', undefined, undefined, undefined, ipAddress, false, 'Invalid code');
      throw new NotFoundException('Invalid code');
    }

    if (beneficiary.status !== 'APPROVED') {
      await this.auditService.log(userId, 'CODE_VERIFY_FAIL', 'Distribution', beneficiary.id, beneficiary.sessionId, beneficiary.centerId, ipAddress, false, 'Beneficiary not approved');
      throw new BadRequestException('Beneficiary is not approved for collection');
    }

    if (beneficiary.collectedAt) {
      await this.auditService.log(userId, 'CODE_VERIFY_FAIL', 'Distribution', beneficiary.id, beneficiary.sessionId, beneficiary.centerId, ipAddress, false, 'Code already used');
      throw new BadRequestException('This code has already been used');
    }

    if (beneficiary.session.status !== 'DISTRIBUTION_ACTIVE') {
      throw new BadRequestException('Distribution is not currently active');
    }

    await this.verifyCenterAccess(userId, beneficiary.centerId);

    await this.auditService.log(userId, 'CODE_VERIFY_SUCCESS', 'Distribution', beneficiary.id, beneficiary.sessionId, beneficiary.centerId, ipAddress, true);

    return {
      valid: true,
      beneficiary: {
        id: beneficiary.id,
        fullName: beneficiary.fullName,
        type: beneficiary.type,
        code: beneficiary.uniqueCode,
        distributionDay: beneficiary.distributionDay,
        distributionTime: beneficiary.distributionTime,
        approvedSlots: beneficiary.approvedSlots,
        centerName: beneficiary.center.name,
        stateName: beneficiary.state.name,
      },
    };
  }

  async collect(code: string, userId: string, ipAddress?: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { uniqueCode: code },
      include: { session: true },
    });

    if (!beneficiary) {
      throw new NotFoundException('Invalid code');
    }

    if (beneficiary.status !== 'APPROVED') {
      throw new BadRequestException('Beneficiary is not approved');
    }

    if (beneficiary.collectedAt) {
      throw new BadRequestException('Already collected');
    }

    if (beneficiary.session.status !== 'DISTRIBUTION_ACTIVE') {
      throw new BadRequestException('Distribution is not currently active');
    }

    await this.verifyCenterAccess(userId, beneficiary.centerId);

    if (!beneficiary.distributionDay || !beneficiary.distributionTime) {
      throw new BadRequestException('Beneficiary has no assigned distribution day/time');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.beneficiary.update({
        where: { id: beneficiary.id },
        data: {
          collectedAt: new Date(),
          collectedById: userId,
        },
      });

      await tx.distribution.create({
        data: {
          beneficiaryId: beneficiary.id,
          sessionId: beneficiary.sessionId,
          code: code,
          day: beneficiary.distributionDay!,
          time: beneficiary.distributionTime!,
          verifiedById: userId,
          verifiedAt: new Date(),
          collected: true,
          collectedById: userId,
          collectedAt: new Date(),
        },
      });

      return result;
    });

    await this.auditService.log(userId, 'COLLECT', 'Distribution', beneficiary.id, beneficiary.sessionId, beneficiary.centerId, ipAddress, true);

    return updated;
  }

  async getCollectionStats(params: {
    sessionId?: string;
    centerId?: string;
    distributionDay?: string;
  }) {
    const where: any = {};
    if (params.sessionId) where.sessionId = params.sessionId;
    if (params.centerId) where.centerId = params.centerId;
    if (params.distributionDay) where.distributionDay = params.distributionDay;
    where.status = 'APPROVED';

    const total = await this.prisma.beneficiary.count({ where });
    const collected = await this.prisma.beneficiary.count({
      where: { ...where, collectedAt: { not: null } },
    });

    return {
      total,
      collected,
      remaining: total - collected,
      completionRate: total > 0 ? ((collected / total) * 100).toFixed(1) + '%' : '0%',
    };
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
