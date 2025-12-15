import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { EnvService } from '@cfg/schema/env.service';
import { UserService } from '../../user/services';
import { GithubOauthService } from './github-oauth.service';
import { RefreshTokenService } from './refresh-token.service';
import { User } from '../../user/entities';
import { RefreshToken } from '../entities';
import { Request, Response } from 'express';

const jwtServiceMock = {
  sign: jest.fn(),
};

const envServiceMock = {
  frontendUrl: 'http://localhost:3000',
  maxSessionsPerUser: 5,
};

const userServiceMock = {
  findOrCreate: jest.fn(),
};

const githubOauthServiceMock = {
  buildAuthorizeUrl: jest.fn(),
  exchangeCodeForToken: jest.fn(),
  fetchGithubUser: jest.fn(),
  fetchPrimaryEmail: jest.fn(),
};

const refreshTokenServiceMock = {
  countActiveSessions: jest.fn(),
  create: jest.fn(),
  findByToken: jest.fn(),
  findValidByToken: jest.fn(),
  revoke: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let jwtServiceInstance: JwtService;
  let envServiceInstance: EnvService;
  let userServiceInstance: UserService;
  let githubOauthServiceInstance: GithubOauthService;
  let refreshTokenServiceInstance: RefreshTokenService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: GithubOauthService,
          useValue: githubOauthServiceMock,
        },
        {
          provide: RefreshTokenService,
          useValue: refreshTokenServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtServiceInstance = module.get<JwtService>(JwtService);
    envServiceInstance = module.get<EnvService>(EnvService);
    userServiceInstance = module.get<UserService>(UserService);
    githubOauthServiceInstance = module.get<GithubOauthService>(GithubOauthService);
    refreshTokenServiceInstance = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should generate PKCE data with state, code verifier, and code challenge', async () => {
    const result = await authService.generatePkceData();

    expect(result).toHaveProperty('state');
    expect(result).toHaveProperty('codeVerifier');
    expect(result).toHaveProperty('codeChallenge');
    expect(typeof result.state).toBe('string');
    expect(typeof result.codeVerifier).toBe('string');
    expect(typeof result.codeChallenge).toBe('string');
    expect(result.state.length).toBeGreaterThan(0);
    expect(result.codeVerifier.length).toBeGreaterThan(0);
    expect(result.codeChallenge.length).toBeGreaterThan(0);
  });

  it('should return GitHub authorize URL', () => {
    const state = 'test-state';
    const codeChallenge = 'test-challenge';
    const expectedUrl = 'https://github.com/login/oauth/authorize?params=test';
    githubOauthServiceMock.buildAuthorizeUrl.mockReturnValue(expectedUrl);

    const result = authService.getGithubAuthorizeUrl(state, codeChallenge);

    expect(result).toBe(expectedUrl);
    expect(githubOauthServiceMock.buildAuthorizeUrl).toHaveBeenCalledWith(state, codeChallenge);
    expect(githubOauthServiceMock.buildAuthorizeUrl).toHaveBeenCalledTimes(1);
  });

  it('should handle callback and return auth result', async () => {
    const code = 'auth-code';
    const codeVerifier = 'verifier';
    const agentInfo = 'Mozilla/5.0';
    const mockTokenResponse = { access_token: 'github-token' };
    const mockGithubUser = {
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://avatar.url',
      email: 'test@example.com',
    };
    const mockUser = {
      id: 'user-id',
      ghLogin: 'testuser',
      name: 'Test User',
      role: { name: 'user' },
    } as User;
    const mockRefreshToken = {
      id: 'token-id',
      token: 'refresh-token',
    } as RefreshToken;
    const expectedAccessToken = 'jwt-access-token';

    githubOauthServiceMock.exchangeCodeForToken.mockResolvedValue(mockTokenResponse);
    githubOauthServiceMock.fetchGithubUser.mockResolvedValue(mockGithubUser);
    userServiceMock.findOrCreate.mockResolvedValue(mockUser);
    refreshTokenServiceMock.countActiveSessions.mockResolvedValue(2);
    refreshTokenServiceMock.create.mockResolvedValue(mockRefreshToken);
    jwtServiceMock.sign.mockReturnValue(expectedAccessToken);

    const result = await authService.handleCallback(code, codeVerifier, agentInfo);

    expect(result).toEqual({
      accessToken: expectedAccessToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    });
    expect(githubOauthServiceMock.exchangeCodeForToken).toHaveBeenCalledWith(code, codeVerifier);
    expect(githubOauthServiceMock.fetchGithubUser).toHaveBeenCalledWith(mockTokenResponse.access_token);
    expect(userServiceMock.findOrCreate).toHaveBeenCalledWith({
      ghLogin: mockGithubUser.login,
      name: mockGithubUser.name,
      avatar: mockGithubUser.avatar_url,
      email: mockGithubUser.email,
    });
    expect(refreshTokenServiceMock.countActiveSessions).toHaveBeenCalledWith(mockUser.id);
    expect(refreshTokenServiceMock.create).toHaveBeenCalledWith(mockUser, agentInfo);
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      name: mockUser.name,
      email: mockUser.ghLogin,
      role: mockUser.role.name,
    });
  });

  it('should generate access token for user', () => {
    const user = {
      id: 'user-id',
      name: 'Test User',
      ghLogin: 'testuser',
      role: { name: 'user' },
    } as User;
    const expectedToken = 'generated-access-token';
    jwtServiceMock.sign.mockReturnValue(expectedToken);

    const result = authService.generateAccessToken(user);

    expect(result).toBe(expectedToken);
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: user.id,
      name: user.name,
      email: user.ghLogin,
      role: user.role.name,
    });
    expect(jwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should logout user and revoke refresh token', async () => {
    const token = 'refresh-token';
    const mockRefreshToken = {
      id: 'token-id',
      token,
    } as RefreshToken;
    refreshTokenServiceMock.findByToken.mockResolvedValue(mockRefreshToken);
    refreshTokenServiceMock.revoke.mockResolvedValue(undefined);

    await authService.logout(token);

    expect(refreshTokenServiceMock.findByToken).toHaveBeenCalledWith(token);
    expect(refreshTokenServiceMock.revoke).toHaveBeenCalledWith(token);
    expect(refreshTokenServiceMock.findByToken).toHaveBeenCalledTimes(1);
    expect(refreshTokenServiceMock.revoke).toHaveBeenCalledTimes(1);
  });

  it('should refresh access token with valid refresh token', async () => {
    const token = 'valid-refresh-token';
    const mockUser = {
      id: 'user-id',
      name: 'Test User',
      ghLogin: 'testuser',
      role: { name: 'user' },
    } as User;
    const mockRefreshToken = {
      id: 'token-id',
      token,
      user: mockUser,
    } as RefreshToken;
    const expectedAccessToken = 'new-access-token';
    refreshTokenServiceMock.findValidByToken.mockResolvedValue(mockRefreshToken);
    jwtServiceMock.sign.mockReturnValue(expectedAccessToken);

    const result = await authService.refreshAccessToken(token);

    expect(result).toBe(expectedAccessToken);
    expect(refreshTokenServiceMock.findValidByToken).toHaveBeenCalledWith(token);
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      name: mockUser.name,
      email: mockUser.ghLogin,
      role: mockUser.role.name,
    });
  });

  it('should validate state when cookie and query state match', () => {
    const cookieState = 'matching-state';
    const queryState = 'matching-state';

    const result = authService.validateState(cookieState, queryState);

    expect(result).toBe(true);
  });

  it('should return false when validating state with matching values', () => {
    const cookieState = 'state-value';
    const queryState = 'state-value';

    const result = authService.validateState(cookieState, queryState);

    expect(result).toBe(true);
  });
});
