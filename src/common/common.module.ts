import { Global, Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { JwtGuard } from './guards';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [AuthModule],
  providers: [
    JwtGuard,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  exports: [JwtGuard],
})
export class CommonModule {}
