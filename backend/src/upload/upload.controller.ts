import {
  Controller, Post, Get, Patch, Param, UseGuards, UseInterceptors,
  UploadedFile, UploadedFiles, Query, Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
    @Body('beneficiaryId') beneficiaryId?: string,
    @Body('sessionYear') sessionYear?: string,
  ) {
    return this.uploadService.uploadFile(file, category, beneficiaryId, sessionYear);
  }

  @Post('public')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPublicFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
    @Body('beneficiaryId') beneficiaryId?: string,
    @Body('sessionYear') sessionYear?: string,
  ) {
    return this.uploadService.uploadFile(file, category, beneficiaryId, sessionYear);
  }

  @Post('public/multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fileSize: 5242880 } }))
  uploadPublicMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('category') category: string,
    @Body('beneficiaryId') beneficiaryId?: string,
    @Body('sessionYear') sessionYear?: string,
  ) {
    return this.uploadService.uploadMultipleFiles(files, category, beneficiaryId, sessionYear);
  }

  @Patch('link/:beneficiaryId')
  @UseGuards(JwtAuthGuard)
  linkDocuments(
    @Param('beneficiaryId') beneficiaryId: string,
    @Body('documentIds') documentIds: string[],
  ) {
    return this.uploadService.linkDocumentsToBeneficiary(documentIds, beneficiaryId);
  }

  @Get('beneficiary/:beneficiaryId')
  @UseGuards(JwtAuthGuard)
  getDocuments(@Param('beneficiaryId') beneficiaryId: string) {
    return this.uploadService.getBeneficiaryDocuments(beneficiaryId);
  }
}
