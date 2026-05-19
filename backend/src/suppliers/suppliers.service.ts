import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; centerId?: string }) {
    const { skip = 0, take = 20, centerId } = params;
    const where: any = {};
    if (centerId) where.centerId = centerId;

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          center: { select: { id: true, name: true } },
          state: { select: { id: true, name: true } },
          _count: { select: { cows: true } },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        center: true,
        state: true,
        cows: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findById(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }
}
