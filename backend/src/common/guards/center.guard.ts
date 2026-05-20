import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CenterGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    if (user.role !== 'CENTER_ADMIN') {
      throw new ForbiddenException('Insufficient role');
    }

    const centerId = await this.resolveCenterId(request);

    if (!centerId) {
      throw new ForbiddenException('Cannot determine resource center');
    }

    const userCenter = await this.prisma.userCenter.findFirst({
      where: { userId: user.id, centerId },
    });

    if (!userCenter) {
      throw new ForbiddenException('You do not have access to this center');
    }

    return true;
  }

  private async resolveCenterId(request: any): Promise<string | null> {
    const { params } = request;

    if (params.centerId) {
      const center = await this.prisma.center.findUnique({ where: { id: params.centerId }, select: { id: true } });
      if (center) return center.id;
      return null;
    }

    const resourceId = params.beneficiaryId || params.id;
    if (!resourceId) return null;

    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id: resourceId },
      select: { centerId: true },
    });
    if (beneficiary) return beneficiary.centerId;

    const cow = await this.prisma.cow.findUnique({
      where: { id: resourceId },
      select: { centerId: true },
    });
    if (cow) return cow.centerId;

    const distribution = await this.prisma.distribution.findUnique({
      where: { id: resourceId },
      select: { beneficiary: { select: { centerId: true } } },
    });
    if (distribution?.beneficiary) return distribution.beneficiary.centerId;

    return null;
  }
}
