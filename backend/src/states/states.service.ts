import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.state.findMany({
      include: { lgas: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const state = await this.prisma.state.findUnique({
      where: { id },
      include: { lgas: true },
    });
    if (!state) throw new NotFoundException('State not found');
    return state;
  }

  async create(data: { name: string; code: string }) {
    const existing = await this.prisma.state.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException('State code already exists');
    return this.prisma.state.create({ data });
  }

  async seedNigerianStates() {
    const states = [
      { name: 'Abia', code: 'AB' },
      { name: 'Adamawa', code: 'AD' },
      { name: 'Akwa Ibom', code: 'AK' },
      { name: 'Anambra', code: 'AN' },
      { name: 'Bauchi', code: 'BA' },
      { name: 'Bayelsa', code: 'BY' },
      { name: 'Benue', code: 'BE' },
      { name: 'Borno', code: 'BO' },
      { name: 'Cross River', code: 'CR' },
      { name: 'Delta', code: 'DE' },
      { name: 'Ebonyi', code: 'EB' },
      { name: 'Edo', code: 'ED' },
      { name: 'Ekiti', code: 'EK' },
      { name: 'Enugu', code: 'EN' },
      { name: 'Gombe', code: 'GO' },
      { name: 'Imo', code: 'IM' },
      { name: 'Jigawa', code: 'JI' },
      { name: 'Kaduna', code: 'KD' },
      { name: 'Kano', code: 'KN' },
      { name: 'Katsina', code: 'KT' },
      { name: 'Kebbi', code: 'KE' },
      { name: 'Kogi', code: 'KO' },
      { name: 'Kwara', code: 'KW' },
      { name: 'Lagos', code: 'LA' },
      { name: 'Nasarawa', code: 'NA' },
      { name: 'Niger', code: 'NI' },
      { name: 'Ogun', code: 'OG' },
      { name: 'Ondo', code: 'ON' },
      { name: 'Osun', code: 'OS' },
      { name: 'Oyo', code: 'OY' },
      { name: 'Plateau', code: 'PL' },
      { name: 'Rivers', code: 'RI' },
      { name: 'Sokoto', code: 'SO' },
      { name: 'Taraba', code: 'TA' },
      { name: 'Yobe', code: 'YO' },
      { name: 'Zamfara', code: 'ZA' },
      { name: 'FCT', code: 'FC' },
    ];

    const created = [];
    for (const state of states) {
      const existing = await this.prisma.state.findUnique({ where: { code: state.code } });
      if (!existing) {
        created.push(await this.prisma.state.create({ data: state }));
      }
    }

    return { count: created.length, states: created };
  }

  async findLgasByState(stateId: string) {
    await this.findById(stateId);
    return this.prisma.lga.findMany({
      where: { stateId },
      orderBy: { name: 'asc' },
    });
  }

  async createLga(stateId: string, name: string) {
    await this.findById(stateId);
    return this.prisma.lga.create({
      data: { name, stateId },
    });
  }
}
