import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignCentersDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string, @Query('role') role?: string) {
    return this.usersService.findAll({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      role,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/centers')
  assignCenters(@Param('id') id: string, @Body() dto: AssignCentersDto) {
    return this.usersService.assignCenters(id, dto.centerIds);
  }

  @Patch(':id/disable')
  disable(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.disable(id, userId);
  }

  @Patch(':id/enable')
  enable(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.enable(id, userId);
  }
}
