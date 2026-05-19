import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CenterGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role === 'SUPER_ADMIN') {
      return true;
    }

    const centerId = request.params?.centerId || request.body?.centerId || request.query?.centerId;

    if (!centerId) {
      return true;
    }

    const userCenter = await this.prisma.userCenter.findFirst({
      where: { userId: user.id, centerId },
    });

    if (!userCenter) {
      throw new ForbiddenException('You do not have access to this center');
    }

    return true;
  }
}
