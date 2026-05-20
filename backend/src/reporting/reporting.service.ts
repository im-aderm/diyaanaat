import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(sessionId?: string, centerId?: string, user?: any) {
    if (user?.role === 'CENTER_ADMIN' && user?.userCenters?.length) {
      centerId = centerId || user.userCenters[0].centerId;
    }

    const sessionWhere: any = {};
    if (sessionId) sessionWhere.id = sessionId;

    const activeSession = sessionId
      ? await this.prisma.session.findUnique({ where: { id: sessionId } })
      : await this.prisma.session.findFirst({
          where: { status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'DISTRIBUTION_ACTIVE'] } },
        });

    const targetSessionId = activeSession?.id;
    if (!targetSessionId) {
      return { message: 'No active session found' };
    }

    const beneficiaryWhere: any = { sessionId: targetSessionId };
    if (centerId) beneficiaryWhere.centerId = centerId;

    const cowWhere: any = { sessionId: targetSessionId };
    if (centerId) cowWhere.centerId = centerId;

    const [
      totalBeneficiaries,
      pending,
      approved,
      rejected,
      collected,
      totalCows,
      slaughtered,
      distributions,
    ] = await Promise.all([
      this.prisma.beneficiary.count({ where: beneficiaryWhere }),
      this.prisma.beneficiary.count({ where: { ...beneficiaryWhere, status: 'PENDING' } }),
      this.prisma.beneficiary.count({ where: { ...beneficiaryWhere, status: 'APPROVED' } }),
      this.prisma.beneficiary.count({ where: { ...beneficiaryWhere, status: 'REJECTED' } }),
      this.prisma.beneficiary.count({ where: { ...beneficiaryWhere, collectedAt: { not: null } } }),
      this.prisma.cow.count({ where: cowWhere }),
      this.prisma.cow.count({ where: { ...cowWhere, status: 'SLAUGHTERED' } }),
      this.prisma.distribution.count({ where: { sessionId: targetSessionId, ...(centerId ? { beneficiary: { centerId } } : {}) } }),
    ]);

    const totalSlots = await this.prisma.beneficiary.aggregate({
      where: { ...beneficiaryWhere, status: 'APPROVED' },
      _sum: { approvedSlots: true },
    });

    return {
      session: activeSession,
      beneficiaries: {
        total: totalBeneficiaries,
        pending,
        approved,
        rejected,
        collected,
        collectionRate: approved > 0 ? ((collected / approved) * 100).toFixed(1) + '%' : '0%',
        totalApprovedSlots: totalSlots._sum.approvedSlots || 0,
      },
      inventory: {
        totalCows,
        slaughtered,
      },
      distributions: {
        total: distributions,
      },
    };
  }

  async getBeneficiaryReport(params: {
    sessionId?: string;
    centerId?: string;
    stateId?: string;
  }, user?: any) {
    let centerId = params.centerId;
    if (user?.role === 'CENTER_ADMIN' && user?.userCenters?.length) {
      centerId = centerId || user.userCenters[0].centerId;
    }
    const where: any = {};
    if (params.sessionId) where.sessionId = params.sessionId;
    if (centerId) where.centerId = centerId;
    if (params.stateId) where.stateId = params.stateId;

    const [statusCounts, typeCounts, stateCounts, centerCounts] = await Promise.all([
      this.prisma.beneficiary.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.beneficiary.groupBy({ by: ['type'], where, _count: true }),
      this.prisma.beneficiary.groupBy({
        by: ['stateId'],
        where,
        _count: true,
        orderBy: { _count: { stateId: 'desc' } },
      }),
      this.prisma.beneficiary.groupBy({
        by: ['centerId'],
        where,
        _count: true,
        orderBy: { _count: { centerId: 'desc' } },
      }),
    ]);

    const stateDetails = await this.prisma.state.findMany();
    const centerDetails = await this.prisma.center.findMany();

    return {
      statusCounts,
      typeCounts,
      byState: stateCounts.map((s) => ({
        ...s,
        stateName: stateDetails.find((st) => st.id === s.stateId)?.name || 'Unknown',
      })),
      byCenter: centerCounts.map((c) => ({
        ...c,
        centerName: centerDetails.find((ct) => ct.id === c.centerId)?.name || 'Unknown',
      })),
    };
  }

  async getInventoryReport(params: { centerId?: string; sessionId?: string }, user?: any) {
    let centerId = params.centerId;
    if (user?.role === 'CENTER_ADMIN' && user?.userCenters?.length) {
      centerId = centerId || user.userCenters[0].centerId;
    }
    const where: any = {};
    if (centerId) where.centerId = centerId;
    if (params.sessionId) where.sessionId = params.sessionId;

    const [statusCounts, supplierCounts, costSummary, yieldSummary] = await Promise.all([
      this.prisma.cow.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.cow.groupBy({
        by: ['supplierId'],
        where,
        _count: true,
        orderBy: { _count: { supplierId: 'desc' } },
      }),
      this.prisma.cow.aggregate({ where, _sum: { purchaseCost: true }, _avg: { purchaseCost: true } }),
      this.prisma.cow.aggregate({ where, _sum: { estimatedYield: true }, _avg: { estimatedYield: true } }),
    ]);

    const supplierDetails = await this.prisma.supplier.findMany({
      where: { id: { in: supplierCounts.map((s) => s.supplierId) } },
    });

    return {
      statusCounts,
      bySupplier: supplierCounts.map((s) => ({
        ...s,
        supplierName: supplierDetails.find((sup) => sup.id === s.supplierId)?.name || 'Unknown',
      })),
      cost: {
        total: costSummary._sum.purchaseCost,
        average: costSummary._avg.purchaseCost,
      },
      yield: {
        total: yieldSummary._sum.estimatedYield,
        average: yieldSummary._avg.estimatedYield,
      },
    };
  }

  async getGeographicReport(sessionId?: string, centerId?: string, user?: any) {
    if (user?.role === 'CENTER_ADMIN' && user?.userCenters?.length) {
      centerId = centerId || user.userCenters[0].centerId;
    }
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (centerId) where.centerId = centerId;

    const stateData = await this.prisma.beneficiary.groupBy({
      by: ['stateId'],
      where,
      _count: true,
      orderBy: { _count: { stateId: 'desc' } },
    });

    const states = await this.prisma.state.findMany();
    const centers = await this.prisma.center.findMany({
      include: { centerStates: { include: { state: true } } },
    });

    return {
      byState: stateData.map((s) => ({
        stateName: states.find((st) => st.id === s.stateId)?.name || 'Unknown',
        count: s._count,
      })),
      centers: centers.map((c) => ({
        name: c.name,
        code: c.code,
        states: c.centerStates.map((cs) => cs.state.name),
      })),
    };
  }
}
