import { Module } from '@nestjs/common';
import { AppConfigModule } from '@cfg/app-config.module';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@usr/user.module';
import { CommonModule } from '@cmn/common.module';
import { ChatModule } from '@chat/chat.module';
import { PromptsModule } from '@prompts/prompts.module';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    AuthModule,
    UserModule,
    ChatModule,
    PromptsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
