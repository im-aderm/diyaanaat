import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; role?: string }) {
    const { skip = 0, take = 20, role } = params;
    const where: any = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: { userCenters: { include: { center: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(({ passwordHash, ...u }) => u),
      total,
      skip,
      take,
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userCenters: { include: { center: true } } },
    });

    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: dto.role,
      },
    });

    if (dto.centerIds?.length) {
      await this.prisma.userCenter.createMany({
        data: dto.centerIds.map((centerId) => ({ userId: user.id, centerId })),
      });
    }

    return this.findById(user.id);
  }

  async update(id: string, data: { fullName?: string; role?: UserRole; isActive?: boolean }) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async assignCenters(userId: string, centerIds: string[]) {
    await this.findById(userId);

    await this.prisma.userCenter.deleteMany({ where: { userId } });

    if (centerIds.length > 0) {
      await this.prisma.userCenter.createMany({
        data: centerIds.map((centerId) => ({ userId, centerId })),
      });
    }

    return this.findById(userId);
  }

  async disable(id: string) {
    return this.update(id, { isActive: false });
  }

  async enable(id: string) {
    return this.update(id, { isActive: true });
  }
}
