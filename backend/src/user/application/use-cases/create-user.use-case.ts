import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity.js';
import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../../domain/errors/username-already-exists.error.js';
import { assertValidPassword } from '../../domain/password-policy.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { PasswordHasher } from '../ports/password-hasher.js';

export interface CreateUserInput {
    name: string;
    username: string;
    email: string;
    /** Senha temporária: o usuário será obrigado a trocá-la no primeiro login. */
    password: string;
    role: UserRole;
}

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(input: CreateUserInput): Promise<User> {
        const username = User.normalizeUsername(input.username);
        const email = User.normalizeEmail(input.email);

        if (await this.userRepository.findByUsername(username)) {
            throw new UsernameAlreadyExistsError();
        }
        if (await this.userRepository.findByEmail(email)) {
            throw new EmailAlreadyExistsError();
        }

        assertValidPassword(input.password);
        const user = User.create({
            name: input.name,
            username,
            email,
            passwordHash: await this.passwordHasher.hash(input.password),
            role: input.role,
            mustChangePassword: true,
        });
        await this.userRepository.save(user);

        return user;
    }
}
