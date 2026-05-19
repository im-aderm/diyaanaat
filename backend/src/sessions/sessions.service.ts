import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { gregorianYear: 'desc' },
      include: { _count: { select: { beneficiaries: true } } },
    });
  }

  async findActive() {
    return this.prisma.session.findFirst({
      where: {
        status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DISTRIBUTION_ACTIVE'] },
      },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        _count: { select: { beneficiaries: true, cows: true } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async create(dto: CreateSessionDto) {
    const existing = await this.prisma.session.findUnique({
      where: { gregorianYear: dto.gregorianYear },
    });
    if (existing) throw new ConflictException('Session for this year already exists');

    return this.prisma.session.create({ data: dto });
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findById(id);
    return this.prisma.session.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: SessionStatus) {
    const session = await this.findById(id);

    if (status === 'REGISTRATION_OPEN') {
      const existingActive = await this.prisma.session.findFirst({
        where: {
          id: { not: id },
          status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DISTRIBUTION_ACTIVE'] },
        },
      });
      if (existingActive) {
        throw new BadRequestException('Only one active session is allowed at a time');
      }
    }

    return this.prisma.session.update({
      where: { id },
      data: { status },
    });
  }

  async getPublicRegistrationStatus() {
    const session = await this.prisma.session.findFirst({
      where: { status: 'REGISTRATION_OPEN' },
    });

    if (!session) return { isOpen: false };

    return {
      isOpen: true,
      session: {
        id: session.id,
        name: session.name,
        gregorianYear: session.gregorianYear,
        hijriYear: session.hijriYear,
        registrationCloseDate: session.registrationCloseDate,
      },
    };
  }
}
