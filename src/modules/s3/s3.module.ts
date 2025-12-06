import { Global, Module } from '@nestjs/common';
import { S3Service } from './services';
import { IsValidFileTypeConstraint } from './validators';

@Global()
@Module({
  providers: [S3Service, IsValidFileTypeConstraint],
  exports: [S3Service, IsValidFileTypeConstraint],
})
export class S3Module {}
