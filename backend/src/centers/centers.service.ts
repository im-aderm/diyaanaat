import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/center.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.center.findMany({
      include: { centerStates: { include: { state: true } }, _count: { select: { beneficiaries: true, userCenters: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: { centerStates: { include: { state: true } }, userCenters: { include: { user: { select: { id: true, fullName: true, email: true, role: true } } } } },
    });
    if (!center) throw new NotFoundException('Center not found');
    return center;
  }

  async create(dto: CreateCenterDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.center.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Center code already exists');

      const center = await tx.center.create({
        data: { name: dto.name, code: dto.code, address: dto.address, phone: dto.phone, email: dto.email },
      });

      if (dto.stateIds?.length) {
        await tx.centerState.createMany({ data: dto.stateIds.map((stateId) => ({ centerId: center.id, stateId })) });
      }

      const adminIds: string[] = [];

      if (dto.adminIds?.length) {
        for (const adminId of dto.adminIds) {
          await tx.userCenter.create({ data: { userId: adminId, centerId: center.id } });
          adminIds.push(adminId);
        }
      }

      if (dto.adminEmail && dto.adminName && dto.adminPassword) {
        const existingUser = await tx.user.findUnique({ where: { email: dto.adminEmail } });
        if (!existingUser) {
          const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
          const newAdmin = await tx.user.create({
            data: { email: dto.adminEmail, fullName: dto.adminName, passwordHash, role: 'CENTER_ADMIN' },
          });
          await tx.userCenter.create({ data: { userId: newAdmin.id, centerId: center.id } });
          adminIds.push(newAdmin.id);
        }
      }

      return center;
    }).then((center) => this.findById(center.id));
  }

  async update(id: string, dto: UpdateCenterDto) {
    await this.findById(id);
    return this.prisma.center.update({ where: { id }, data: dto });
  }

  async assignStates(centerId: string, stateIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.center.findUniqueOrThrow({ where: { id: centerId } });
      await tx.centerState.deleteMany({ where: { centerId } });
      if (stateIds.length > 0) {
        await tx.centerState.createMany({ data: stateIds.map((stateId) => ({ centerId, stateId })), skipDuplicates: true });
      }
    }).then(() => this.findById(centerId));
  }

  async removeState(centerId: string, stateId: string) {
    await this.prisma.centerState.deleteMany({ where: { centerId, stateId } });
    return this.findById(centerId);
  }

  async findByState(stateId: string) {
    const centerStates = await this.prisma.centerState.findMany({ where: { stateId }, include: { center: true } });
    return centerStates.map((cs) => cs.center);
  }
}
