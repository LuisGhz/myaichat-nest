import { Module } from '@nestjs/common';
import { AppConfigModule } from '@cfg/app-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AppConfigModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
