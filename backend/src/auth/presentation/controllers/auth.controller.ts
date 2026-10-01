import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { optionalEnv } from '../../../shared/infrastructure/config/env.js';
import { UserResponseDto } from '../../../user/presentation/dtos/user.response.dto.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-tokens.use-case.js';
import { AllowPasswordChangePending } from '../decorators/allow-password-change-pending.decorator.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { AuthResponseDto } from '../dtos/auth.response.dto.js';
import { ChangePasswordRequestDto } from '../dtos/change-password.request.dto.js';
import { LoginRequestDto } from '../dtos/login.request.dto.js';

export const REFRESH_COOKIE = 'refresh_token';
/** O cookie só é enviado para as rotas de auth: nenhuma outra rota precisa dele. */
const REFRESH_COOKIE_PATH = '/auth';
const LOGIN_THROTTLE_LIMIT = Number(optionalEnv('LOGIN_THROTTLE_LIMIT', '10'));

@Controller('auth')
export class AuthController {
    constructor(
        private readonly login: LoginUseCase,
        private readonly refreshTokens: RefreshTokensUseCase,
        private readonly logout: LogoutUseCase,
        private readonly changePassword: ChangePasswordUseCase,
        private readonly getCurrentUser: GetCurrentUserUseCase,
    ) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: 60_000 } })
    async signIn(@Body() body: LoginRequestDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
        const result = await this.login.execute(body);
        this.setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
        return AuthResponseDto.from(result.accessToken, result.user);
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
        const refreshToken = this.readRefreshCookie(req);
        if (!refreshToken) {
            throw new UnauthorizedException('Missing refresh token');
        }
        const result = await this.refreshTokens.execute({ refreshToken });
        this.setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
        return AuthResponseDto.from(result.accessToken, result.user);
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        const refreshToken = this.readRefreshCookie(req);
        if (refreshToken) {
            await this.logout.execute({ refreshToken });
        }
        res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    }

    @AllowPasswordChangePending()
    @Patch('password')
    async updatePassword(
        @CurrentUser() user: CurrentUser,
        @Body() body: ChangePasswordRequestDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const result = await this.changePassword.execute({ userId: user.id, ...body });
        this.setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
        return AuthResponseDto.from(result.accessToken, result.user);
    }

    @AllowPasswordChangePending()
    @Get('me')
    async me(@CurrentUser() user: CurrentUser): Promise<UserResponseDto> {
        return UserResponseDto.fromEntity(await this.getCurrentUser.execute({ userId: user.id }));
    }

    private setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: REFRESH_COOKIE_PATH,
            expires: expiresAt,
        });
    }

    private readRefreshCookie(req: Request): string | null {
        const value = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
        return typeof value === 'string' && value.length > 0 ? value : null;
    }
}
