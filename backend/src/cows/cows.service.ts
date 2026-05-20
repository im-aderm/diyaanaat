import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCowDto, UpdateCowDto } from './dto/cow.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    centerId?: string;
    sessionId?: string;
    supplierId?: string;
    status?: string;
  }) {
    const { skip = 0, take = 20, centerId, sessionId, supplierId, status } = params;
    const where: any = {};
    if (centerId) where.centerId = centerId;
    if (sessionId) where.sessionId = sessionId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.cow.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          center: { select: { id: true, name: true, code: true } },
          supplier: { select: { id: true, name: true } },
          session: { select: { id: true, name: true, gregorianYear: true } },
        },
      }),
      this.prisma.cow.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async findById(id: string) {
    const cow = await this.prisma.cow.findUnique({
      where: { id },
      include: {
        center: true,
        supplier: true,
        session: true,
      },
    });
    if (!cow) throw new NotFoundException('Cow not found');
    return cow;
  }

  async create(dto: CreateCowDto) {
    const tagNumber = dto.tagNumber || `COW-${uuidv4().slice(0, 8).toUpperCase()}`;

    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.prisma.cow.create({
          data: {
            centerId: dto.centerId,
            supplierId: dto.supplierId,
            sessionId: dto.sessionId,
            tagNumber,
            purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
            purchaseCost: dto.purchaseCost,
            estimatedYield: dto.estimatedYield,
            healthStatus: dto.healthStatus,
            notes: dto.notes,
          },
        });
      } catch (error: any) {
        if (error?.code === 'P2002' && attempt < maxRetries - 1) {
          continue;
        }
        throw error;
      }
    }

    throw new BadRequestException('Failed to create cow after retries');
  }

  async update(id: string, dto: UpdateCowDto) {
    await this.findById(id);
    const data: any = { ...dto };
    if (dto.purchaseDate) data.purchaseDate = new Date(dto.purchaseDate);
    return this.prisma.cow.update({ where: { id }, data });
  }

  async getInventoryStats(params: { centerId?: string; sessionId?: string }) {
    const where: any = {};
    if (params.centerId) where.centerId = params.centerId;
    if (params.sessionId) where.sessionId = params.sessionId;

    const [totalCows, statusCounts, totalCost, totalYield] = await Promise.all([
      this.prisma.cow.count({ where }),
      this.prisma.cow.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.cow.aggregate({ where, _sum: { purchaseCost: true } }),
      this.prisma.cow.aggregate({ where, _sum: { estimatedYield: true } }),
    ]);

    return {
      totalCows,
      statusBreakdown: statusCounts,
      totalCost: totalCost._sum.purchaseCost,
      totalEstimatedYield: totalYield._sum.estimatedYield,
    };
  }
}
