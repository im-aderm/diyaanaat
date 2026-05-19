import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    actorId: string,
    action: string,
    entityType: string,
    entityId?: string,
    sessionId?: string,
    centerId?: string,
    ipAddress?: string,
    success = true,
    errorMessage?: string,
    oldValue?: string,
    newValue?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        sessionId,
        centerId,
        ipAddress,
        success,
        errorMessage,
        oldValue,
        newValue,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    actorId?: string;
    entityType?: string;
    entityId?: string;
    sessionId?: string;
    centerId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { skip = 0, take = 50, actorId, entityType, entityId, sessionId, centerId, action, startDate, endDate } = params;
    const where: any = {};

    if (actorId) where.actorId = actorId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (sessionId) where.sessionId = sessionId;
    if (centerId) where.centerId = centerId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
          center: { select: { id: true, name: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, skip, take };
  }
}
