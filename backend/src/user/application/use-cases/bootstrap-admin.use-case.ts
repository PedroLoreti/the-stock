import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity.js';
import { assertValidPassword } from '../../domain/password-policy.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { PasswordHasher } from '../ports/password-hasher.js';

export interface BootstrapAdminInput {
    username: string;
    email: string;
    password: string;
}

/**
 * Cria o administrador inicial quando o sistema ainda não tem nenhum usuário.
 * Idempotente: nas próximas execuções não faz nada. O admin nasce obrigado a trocar a senha.
 */
@Injectable()
export class BootstrapAdminUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(input: BootstrapAdminInput): Promise<User | null> {
        if ((await this.userRepository.count()) > 0) {
            return null;
        }

        assertValidPassword(input.password);
        const admin = User.create({
            name: 'Administrator',
            username: input.username,
            email: input.email,
            passwordHash: await this.passwordHasher.hash(input.password),
            role: UserRole.ADMIN,
            mustChangePassword: true,
        });
        await this.userRepository.save(admin);

        return admin;
    }
}
