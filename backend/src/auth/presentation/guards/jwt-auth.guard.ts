import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../../application/ports/token-service.js';
import { PasswordChangeRequiredError } from '../../domain/errors/password-change-required.error.js';
import { ALLOW_PASSWORD_CHANGE_PENDING_KEY } from '../decorators/allow-password-change-pending.decorator.js';
import { AuthenticatedRequest } from '../decorators/current-user.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Guard global: exige um access token válido em toda rota que não seja @Public().
 * Com a troca de senha pendente, só libera as rotas marcadas com @AllowPasswordChangePending().
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly tokenService: TokenService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.hasMetadata(context, IS_PUBLIC_KEY)) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token = this.extractBearerToken(request.headers.authorization);
        if (!token) {
            throw new UnauthorizedException('Missing access token');
        }

        let payload;
        try {
            payload = await this.tokenService.verifyAccessToken(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }

        request.user = { id: payload.sub, role: payload.role, mustChangePassword: payload.mustChangePassword };

        if (payload.mustChangePassword && !this.hasMetadata(context, ALLOW_PASSWORD_CHANGE_PENDING_KEY)) {
            throw new PasswordChangeRequiredError();
        }
        return true;
    }

    private hasMetadata(context: ExecutionContext, key: string): boolean {
        return this.reflector.getAllAndOverride<boolean>(key, [context.getHandler(), context.getClass()]) === true;
    }

    private extractBearerToken(header: string | undefined): string | null {
        const [scheme, token] = header?.split(' ') ?? [];
        return scheme?.toLowerCase() === 'bearer' && token ? token : null;
    }
}
