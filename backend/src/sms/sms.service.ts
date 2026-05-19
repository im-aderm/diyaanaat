import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Beneficiary } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private prisma: PrismaService) {}

  async sendRegistrationConfirmation(beneficiary: Beneficiary) {
    const template = await this.getTemplate('registration');
    const message = this.interpolate(template, {
      name: beneficiary.fullName,
    });

    return this.send(beneficiary.phoneNumber, message, beneficiary.id, beneficiary.sessionId, 'registration');
  }

  async sendApprovalNotification(beneficiary: Beneficiary & { uniqueCode?: string | null }) {
    const template = await this.getTemplate('approval');
    const message = this.interpolate(template, {
      name: beneficiary.fullName,
      code: beneficiary.uniqueCode || 'N/A',
      day: beneficiary.distributionDay || 'N/A',
      time: beneficiary.distributionTime || 'N/A',
    });

    return this.send(beneficiary.phoneNumber, message, beneficiary.id, beneficiary.sessionId, 'approval');
  }

  async sendRejectionNotification(beneficiary: Beneficiary) {
    const template = await this.getTemplate('rejection');
    const message = this.interpolate(template, {
      name: beneficiary.fullName,
      reason: beneficiary.rejectionReason || 'Not specified',
    });

    return this.send(beneficiary.phoneNumber, message, beneficiary.id, beneficiary.sessionId, 'rejection');
  }

  async sendReminder(beneficiary: Beneficiary & { uniqueCode?: string | null }) {
    const template = await this.getTemplate('reminder');
    const message = this.interpolate(template, {
      name: beneficiary.fullName,
      code: beneficiary.uniqueCode || 'N/A',
      day: beneficiary.distributionDay || 'N/A',
      time: beneficiary.distributionTime || 'N/A',
    });

    return this.send(beneficiary.phoneNumber, message, beneficiary.id, beneficiary.sessionId, 'reminder');
  }

  private async send(
    phoneNumber: string,
    message: string,
    beneficiaryId: string,
    sessionId: string,
    template: string,
  ) {
    const log = await this.prisma.smsLog.create({
      data: {
        beneficiaryId,
        sessionId,
        phoneNumber,
        message,
        template,
        status: 'pending',
      },
    });

    try {
      // TODO: Integrate with actual SMS gateway (e.g., Twilio, Africa's Talking)
      this.logger.log(`SMS to ${phoneNumber}: ${message} (${template})`);

      await this.prisma.smsLog.update({
        where: { id: log.id },
        data: { status: 'sent', sentAt: new Date() },
      });

      return log;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error}`);

      await this.prisma.smsLog.update({
        where: { id: log.id },
        data: { status: 'failed', errorMessage: String(error) },
      });

      throw error;
    }
  }

  private async getTemplate(name: string): Promise<string> {
    const tpl = await this.prisma.smsTemplate.findUnique({ where: { name } });
    if (tpl) return tpl.body;

    const defaults: Record<string, string> = {
      registration: 'Dear {{name}}, your Qurbani registration has been received. You will be notified upon approval.',
      approval: 'Dear {{name}}, your Qurbani application has been approved. Code: {{code}}. Collection: Day {{day}} at {{time}}.',
      rejection: 'Dear {{name}}, your Qurbani application was not approved. Reason: {{reason}}.',
      reminder: 'Reminder: Your Qurbani collection is on Day {{day}} at {{time}}. Code: {{code}}.',
    };

    return defaults[name] || '';
  }

  private interpolate(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
  }

  async getSmsLogs(params: { skip?: number; take?: number; beneficiaryId?: string; status?: string }) {
    const { skip = 0, take = 20, beneficiaryId, status } = params;
    const where: any = {};
    if (beneficiaryId) where.beneficiaryId = beneficiaryId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.smsLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { beneficiary: { select: { fullName: true, phoneNumber: true } } },
      }),
      this.prisma.smsLog.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async updateTemplate(name: string, body: string) {
    return this.prisma.smsTemplate.upsert({
      where: { name },
      update: { body },
      create: { name, body },
    });
  }

  async getTemplates() {
    return this.prisma.smsTemplate.findMany();
  }
}
