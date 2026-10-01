import { User, UserRole } from '../../domain/entities/user.entity.js';

/** Nunca inclui o passwordHash. */
export class UserResponseDto {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly username: string,
        readonly email: string,
        readonly role: UserRole,
        readonly active: boolean,
        readonly mustChangePassword: boolean,
    ) {}

    static fromEntity(user: User): UserResponseDto {
        return new UserResponseDto(
            user.id,
            user.name,
            user.username,
            user.email,
            user.role,
            user.active,
            user.mustChangePassword,
        );
    }
}
