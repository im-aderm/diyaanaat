import {
  Injectable, BadRequestException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { mkdirSync, existsSync } from 'fs';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.uploadDir = this.config.get<string>('upload.dir') || '/app/uploads';
    this.maxFileSize = this.config.get<number>('upload.maxFileSize') || 5242880;
  }

  async uploadFile(
    file: Express.Multer.File,
    category: string,
    beneficiaryId?: string,
    sessionYear?: string,
  ) {
    this.validateFile(file);

    const { relativePath, dirPath, filename } = await this.saveFileToDisk(file, category, sessionYear);

    if (beneficiaryId) {
      await this.prisma.beneficiaryDocument.create({
        data: {
          beneficiaryId,
          type: category,
          filePath: relativePath,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        },
      });
    }

    return {
      filename,
      originalName: file.originalname,
      path: relativePath,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    category: string,
    beneficiaryId?: string,
    sessionYear?: string,
  ) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        this.validateFile(file);
        const { relativePath } = await this.saveFileToDisk(file, category, sessionYear);

        const doc = beneficiaryId
          ? await this.prisma.beneficiaryDocument.create({
              data: {
                beneficiaryId,
                type: category,
                filePath: relativePath,
                originalName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
              },
            })
          : null;

        results.push({
          filename: relativePath.split('/').pop(),
          originalName: file.originalname,
          path: relativePath,
          size: file.size,
          mimeType: file.mimetype,
          documentId: doc?.id || null,
        });
      } catch (err) {
        errors.push({ index: i, originalName: file.originalname, error: err.message });
      }
    }

    return { results, errors, total: files.length, uploaded: results.length };
  }

  async linkDocumentsToBeneficiary(documentIds: string[], beneficiaryId: string) {
    if (!documentIds?.length) return { linked: 0 };

    const result = await this.prisma.beneficiaryDocument.updateMany({
      where: { id: { in: documentIds } },
      data: { beneficiaryId },
    });

    return { linked: result.count };
  }

  async getBeneficiaryDocuments(beneficiaryId: string) {
    return this.prisma.beneficiaryDocument.findMany({
      where: { beneficiaryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private validateFile(file: Express.Multer.File) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File ${file.originalname} size ${file.size} exceeds maximum ${this.maxFileSize} bytes`,
      );
    }
  }

  private async saveFileToDisk(file: Express.Multer.File, category: string, sessionYear?: string) {
    if (sessionYear && !/^\d{4}$/.test(String(sessionYear))) {
      throw new BadRequestException('Invalid session year');
    }

    const ext = extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    const dirPath = sessionYear
      ? join(this.uploadDir, String(sessionYear), category)
      : join(this.uploadDir, category);

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    const filePath = join(dirPath, filename);
    await fs.writeFile(filePath, file.buffer);

    const relativePath = sessionYear
      ? `uploads/${sessionYear}/${category}/${filename}`
      : `uploads/${category}/${filename}`;

    return { relativePath, dirPath, filename };
  }
}
