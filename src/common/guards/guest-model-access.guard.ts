import {
  CanActivate,
  ExecutionContext,
  Injectable,
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

    const modelId = body.modelId;
    if (!modelId) return true;

    await this.modelsService.validateGuestAccessById(modelId, user.role);

    return true;
  }
}
