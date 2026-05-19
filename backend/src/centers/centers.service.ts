import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/center.dto';

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.center.findMany({
      include: {
        centerStates: { include: { state: true } },
        _count: { select: { beneficiaries: true, userCenters: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: {
        centerStates: { include: { state: true } },
        userCenters: { include: { user: { select: { id: true, fullName: true, email: true, role: true } } } },
      },
    });
    if (!center) throw new NotFoundException('Center not found');
    return center;
  }

  async create(dto: CreateCenterDto) {
    const existing = await this.prisma.center.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Center code already exists');

    const center = await this.prisma.center.create({
      data: {
        name: dto.name,
        code: dto.code,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
      },
    });

    if (dto.stateIds?.length) {
      await this.prisma.centerState.createMany({
        data: dto.stateIds.map((stateId) => ({ centerId: center.id, stateId })),
      });
    }

    return this.findById(center.id);
  }

  async update(id: string, dto: UpdateCenterDto) {
    await this.findById(id);
    return this.prisma.center.update({ where: { id }, data: dto });
  }

  async assignStates(centerId: string, stateIds: string[]) {
    await this.findById(centerId);

    await this.prisma.centerState.deleteMany({ where: { centerId } });

    if (stateIds.length > 0) {
      await this.prisma.centerState.createMany({
        data: stateIds.map((stateId) => ({ centerId, stateId })),
        skipDuplicates: true,
      });
    }

    return this.findById(centerId);
  }

  async removeState(centerId: string, stateId: string) {
    await this.prisma.centerState.deleteMany({
      where: { centerId, stateId },
    });
    return this.findById(centerId);
  }

  async findByState(stateId: string) {
    const centerStates = await this.prisma.centerState.findMany({
      where: { stateId },
      include: { center: true },
    });

    return centerStates.map((cs) => cs.center);
  }
}
