import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Beneficiary } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private prisma: PrismaService) {}

  async sendRegistrationConfirmation(beneficiary: Beneficiary & { uniqueCode?: string | null }) {
    const template = await this.getTemplate('registration');
    const message = this.interpolate(template, {
      name: beneficiary.fullName,
      code: beneficiary.uniqueCode || 'N/A',
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

  async sendManualMessage(params: {
    phoneNumbers: string[];
    message: string;
    beneficiaryIds?: string[];
    sessionId?: string;
  }) {
    const results = [];
    for (let i = 0; i < params.phoneNumbers.length; i++) {
      const phone = params.phoneNumbers[i];
      const beneficiaryId = params.beneficiaryIds?.[i];
      try {
        const log = await this.send(phone, params.message, beneficiaryId || '', params.sessionId || '', 'manual');
        results.push({ phone, status: 'sent', logId: log.id });
      } catch (err) {
        results.push({ phone, status: 'failed', error: err.message });
      }
    }
    return { sent: results.filter((r) => r.status === 'sent').length, failed: results.filter((r) => r.status === 'failed').length, results };
  }

  async sendBulkMessage(params: {
    centerId?: string;
    sessionId?: string;
    status?: string;
    message: string;
    excludeCollected?: boolean;
  }) {
    const where: any = {};
    if (params.centerId) where.centerId = params.centerId;
    if (params.sessionId) where.sessionId = params.sessionId;
    if (params.status) where.status = params.status;
    if (params.excludeCollected) where.collectedAt = null;

    const beneficiaries = await this.prisma.beneficiary.findMany({
      where,
      select: { id: true, phoneNumber: true, fullName: true },
    });

    const results = [];
    for (const b of beneficiaries) {
      try {
        const personalized = this.interpolate(params.message, { name: b.fullName });
        const log = await this.send(b.phoneNumber, personalized, b.id, params.sessionId || '', 'bulk');
        results.push({ id: b.id, phone: b.phoneNumber, status: 'sent', logId: log.id });
      } catch (err) {
        results.push({ id: b.id, phone: b.phoneNumber, status: 'failed', error: err.message });
      }
    }

    return { total: beneficiaries.length, sent: results.filter((r) => r.status === 'sent').length, failed: results.filter((r) => r.status === 'failed').length };
  }

  private async send(phoneNumber: string, message: string, beneficiaryId: string, sessionId: string, template: string) {
    const log = await this.prisma.smsLog.create({
      data: { beneficiaryId: beneficiaryId || undefined, sessionId: sessionId || undefined, phoneNumber, message, template, status: 'PENDING' },
    });

    if (process.env.SMS_PROVIDER_ENABLED !== 'true') {
      this.logger.log(`[MOCK] SMS to ${phoneNumber}: ${message} (${template})`);
      await this.prisma.smsLog.update({ where: { id: log.id }, data: { status: 'SENT', sentAt: new Date() } });
      return log;
    }

    try {
      this.logger.log(`SMS to ${phoneNumber}: ${message} (${template})`);
      await this.prisma.smsLog.update({ where: { id: log.id }, data: { status: 'SENT', sentAt: new Date() } });
      return log;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error}`);
      await this.prisma.smsLog.update({ where: { id: log.id }, data: { status: 'FAILED', errorMessage: String(error) } });
      throw error;
    }
  }

  private async getTemplate(name: string): Promise<string> {
    const tpl = await this.prisma.smsTemplate.findUnique({ where: { name } });
    if (tpl) return tpl.body;
    const defaults: Record<string, string> = {
      registration: 'Dear {{name}}, your application has been received. Code: {{code}}. Track your status online.',
      approval: 'Dear {{name}}, your application has been APPROVED. Code: {{code}}. Collection: Day {{day}} at {{time}}.',
      rejection: 'Dear {{name}}, your application was not approved. Reason: {{reason}}.',
      reminder: 'Reminder: Your collection is on Day {{day}} at {{time}}. Code: {{code}}.',
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
      this.prisma.smsLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { beneficiary: { select: { fullName: true, phoneNumber: true } } } }),
      this.prisma.smsLog.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async updateTemplate(name: string, body: string) {
    return this.prisma.smsTemplate.upsert({ where: { name }, update: { body }, create: { name, body } });
  }

  async getTemplates() {
    return this.prisma.smsTemplate.findMany();
  }
}
