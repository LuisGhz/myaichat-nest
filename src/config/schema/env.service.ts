import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService<Env>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.configService.get('NODE_ENV', { infer: true })!;
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true })!;
  }

  get dbHost(): string {
    return this.configService.get('DB_HOST', { infer: true })!;
  }

  get dbPort(): number {
    return this.configService.get('DB_PORT', { infer: true })!;
  }

  get dbUsername(): string {
    return this.configService.get('DB_USERNAME', { infer: true })!;
  }

  get dbPassword(): string {
    return this.configService.get('DB_PASSWORD', { infer: true })!;
  }

  get dbName(): string {
    return this.configService.get('DB_NAME', { infer: true })!;
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true })!;
  }

  get jwtExpiresIn(): string {
    return this.configService.get('JWT_EXPIRES_IN', { infer: true })!;
  }

  get refreshTokenLength(): number {
    return this.configService.get('REFRESH_TOKEN_LENGTH', { infer: true })!;
  }

  get refreshTokenExpiresIn(): string {
    return this.configService.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true })!;
  }

  get openaiApiKey(): string {
    return this.configService.get('OPENAI_API_KEY', { infer: true })!;
  }

  get geminiApiKey(): string {
    return this.configService.get('GEMINI_API_KEY', { infer: true })!;
  }
}
