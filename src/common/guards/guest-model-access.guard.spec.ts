import { ExecutionContext } from '@nestjs/common';
import { GuestModelAccessGuard } from './guest-model-access.guard';
import { ModelsService } from '@mdl/services';
import type { JwtPayload } from '@cmn/interfaces';

describe('GuestModelAccessGuard', () => {
  let guard: GuestModelAccessGuard;
  let modelsService: jest.Mocked<ModelsService>;

  const createMockExecutionContext = (overrides: {
    request?: Record<string, any>;
  } = {}) => {
    const mockRequest = {
      user: null,
      body: {},
      ...(overrides.request || {}),
    };

    const mockContext = {
      switchToHttp: jest.fn(),
    } as unknown as jest.Mocked<ExecutionContext>;

    (mockContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: () => mockRequest,
    });

    return mockContext;
  };

  beforeEach(() => {
    modelsService = {
      validateGuestAccess: jest.fn(),
    } as unknown as jest.Mocked<ModelsService>;

    guard = new GuestModelAccessGuard(modelsService);
  });

  describe('canActivate', () => {
    it('should return true when user is not guest', async () => {
      const user: JwtPayload = {
        sub: 'user-id',
        name: 'User',
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { model: 'gpt-4' },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccess).not.toHaveBeenCalled();
    });

    it('should return true when user is null', async () => {
      const context = createMockExecutionContext({
        request: {
          user: null,
          body: { model: 'gpt-4' },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccess).not.toHaveBeenCalled();
    });

    it('should return true when request body has no model', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: {},
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccess).not.toHaveBeenCalled();
    });

    it('should validate guest access when user is guest and model is provided', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { model: 'gpt-4' },
        },
      });

      (modelsService.validateGuestAccess as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccess).toHaveBeenCalledWith(
        'gpt-4',
        'guest',
      );
    });

    it('should throw error when guest access validation fails', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { model: 'gpt-4' },
        },
      });

      const error = new Error('Guest access denied for this model');
      (modelsService.validateGuestAccess as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(guard.canActivate(context)).rejects.toThrow(error);
    });

    it('should return true for guest user with empty model value', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { model: null },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccess).not.toHaveBeenCalled();
    });

    it('should return true for guest user with empty string model', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { model: '' },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccess).not.toHaveBeenCalled();
    });

    it('should validate guest access with different model values', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const models = ['gpt-3.5-turbo', 'claude-2', 'gemini-pro'];

      for (const model of models) {
        const context = createMockExecutionContext({
          request: {
            user,
            body: { model },
          },
        });

        (modelsService.validateGuestAccess as jest.Mock).mockResolvedValueOnce(
          undefined,
        );

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(modelsService.validateGuestAccess).toHaveBeenCalledWith(
          model,
          'guest',
        );
      }
    });
  });
});
