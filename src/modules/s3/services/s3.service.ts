import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { EnvService } from '@cfg/schema/env.service';
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../consts';
import path from 'path';

@Injectable()
export class S3Service {
  constructor(private readonly envService: EnvService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    this.#validateFile(file);

    const hexPrefix = randomBytes(16).toString('hex');
    const originalName = file.originalname;
    const key = `myaichat/${hexPrefix}-${originalName}`;

    const client = this.#getClient();
    const command = new PutObjectCommand({
      Bucket: this.envService.s3BucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await client.send(command);

    return key;
  }

  #getClient(): S3Client {
    return new S3Client({
      region: 'mx-central-1',
      credentials: {
        accessKeyId: this.envService.s3AccessKey,
        secretAccessKey: this.envService.s3SecretKey,
      },
    });
  }

  #validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No file provided');

    const mimeType = file.mimetype;
    const extension = path.extname(file.originalname).toLowerCase();

    const isValidMimeType = ALLOWED_FILE_TYPES.includes(mimeType as any);
    const isValidExtension = ALLOWED_FILE_EXTENSIONS.includes(extension as any);

    if (!isValidMimeType || !isValidExtension)
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
      );
  }
}
