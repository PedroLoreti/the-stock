import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '../../../user/domain/entities/user.entity.js';

/** O que o JwtAuthGuard extrai do access token e anexa ao request. */
export interface CurrentUser {
    id: string;
    role: UserRole;
    mustChangePassword: boolean;
}

export type AuthenticatedRequest = Request & { user?: CurrentUser };

/** Injeta o usuário autenticado no parâmetro do controller. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
        throw new Error('CurrentUser used on a route without JwtAuthGuard');
    }
    return request.user;
});
