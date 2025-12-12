import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ModelsService } from '@mdl/services';
import type { JwtPayload } from '@cmn/interfaces';

@Injectable()
export class GuestModelAccessGuard implements CanActivate {
  constructor(private readonly modelsService: ModelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    const body = request.body;

    if (!user || user.role !== 'guest') return true;

    const modelValue = body.model;
    if (!modelValue) return true;

    await this.modelsService.validateGuestAccess(modelValue, user.role);

    return true;
  }
}
