import type { User as UserRow } from '../../../generated/prisma/client.js';
import { User } from '../../domain/entities/user.entity.js';

export class UserMapper {
    static toDomain(row: UserRow): User {
        return User.restore({
            id: row.id,
            name: row.name,
            username: row.username,
            email: row.email,
            passwordHash: row.passwordHash,
            role: row.role,
            active: row.active,
            mustChangePassword: row.mustChangePassword,
        });
    }

    static toPersistence(user: User) {
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            active: user.active,
            mustChangePassword: user.mustChangePassword,
        };
    }
}
