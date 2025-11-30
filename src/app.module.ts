import { Module } from '@nestjs/common';
import { AppConfigModule } from '@cfg/app-config.module';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@usr/user.module';
import { CommonModule } from '@cmn/common.module';
import { ChatModule } from '@chat/chat.module';

@Module({
  imports: [AppConfigModule, CommonModule, AuthModule, UserModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
