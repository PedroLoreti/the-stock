import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../user/domain/entities/user.entity.js';
import { AuthenticatedRequest } from '../decorators/current-user.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/** Guard global: aplica o @Roles() da rota (ou do controller). Roda depois do JwtAuthGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!roles || roles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
        if (!user || !roles.includes(user.role)) {
            throw new ForbiddenException('Insufficient role for this action');
        }
        return true;
    }
}
