import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { EnvService } from '@cfg/schema/env.service';
import { AuthService } from './services';
import {
  COOKIE_STATE,
  COOKIE_CODE_VERIFIER,
  COOKIE_REFRESH_TOKEN,
} from './const/cookies.const';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly envService: EnvService,
  ) {}

  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const pkceData = await this.authService.generatePkceData();
    const authorizeUrl = this.authService.getGithubAuthorizeUrl(
      pkceData.state,
      pkceData.codeChallenge,
    );

    const cookieOptions = {
      httpOnly: true,
      secure: this.envService.isProduction,
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    res.cookie(COOKIE_STATE, pkceData.state, cookieOptions);
    res.cookie(COOKIE_CODE_VERIFIER, pkceData.codeVerifier, cookieOptions);

    res.redirect(authorizeUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.envService.frontendUrl;

    // Clear OAuth cookies
    const clearCookies = () => {
      res.clearCookie(COOKIE_STATE);
      res.clearCookie(COOKIE_CODE_VERIFIER);
    };

    this.authService.validateCallbackParams(
      { error, code, state, errorDescription, clearCookies },
      req,
      res,
    );

    const codeVerifier = req.cookies[COOKIE_CODE_VERIFIER];

    try {
      const agentInfo = req.headers['user-agent'] || 'Unknown';
      const result = await this.authService.handleCallback(
        code,
        codeVerifier,
        agentInfo,
      );

      clearCookies();

      // Set refresh token cookie
      res.cookie(COOKIE_REFRESH_TOKEN, result.refreshToken.token, {
        httpOnly: true,
        secure: this.envService.isProduction,
        maxAge: result.refreshToken.exp.getTime() - Date.now(),
      });

      res.redirect(
        `${frontendUrl}/auth/success?accessToken=${result.accessToken}`,
      );
    } catch (err) {
      this.logger.error('OAuth callback error', err);
      clearCookies();

      let errorMessage = 'Authentication failed. Please try again.';
      if (err instanceof UnauthorizedException) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      res.redirect(
        `${frontendUrl}/auth/login?errorMessage=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies[COOKIE_REFRESH_TOKEN];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(COOKIE_REFRESH_TOKEN);
    res.json({ message: 'Logged out successfully' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies[COOKIE_REFRESH_TOKEN];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const accessToken =
        await this.authService.refreshAccessToken(refreshToken);
      res.json({ accessToken });
    } catch {
      res.clearCookie(COOKIE_REFRESH_TOKEN);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
