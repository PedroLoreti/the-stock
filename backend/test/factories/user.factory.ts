import { CreateUserProps, User, UserRole } from '../../src/user/domain/entities/user.entity.js';

let counter = 0;

/** Cria um usuário válido já com a senha "trocada" (mustChangePassword = false), a menos que sobrescrito. */
export function makeUser(overrides: Partial<CreateUserProps> = {}): User {
    counter++;
    return User.create({
        name: `User ${counter}`,
        username: `user${counter}`,
        email: `user${counter}@thestock.local`,
        // Mesmo formato do FakePasswordHasher.
        passwordHash: 'hashed:correct-password',
        role: UserRole.SELLER,
        mustChangePassword: false,
        ...overrides,
    });
}
