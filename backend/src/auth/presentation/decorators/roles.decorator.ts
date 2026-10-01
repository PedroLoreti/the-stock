import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../user/domain/entities/user.entity.js';

export const ROLES_KEY = 'roles';

/** Restringe a rota aos papéis informados. Sem o decorator, qualquer usuário autenticado passa. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
