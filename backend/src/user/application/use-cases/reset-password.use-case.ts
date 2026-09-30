import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import { assertValidPassword } from '../../domain/password-policy.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { PasswordHasher } from '../ports/password-hasher.js';

export interface ResetPasswordInput {
    id: string;
    temporaryPassword: string;
}

/** Um admin define uma senha temporária; o usuário será obrigado a trocá-la no próximo login. */
@Injectable()
export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(input: ResetPasswordInput): Promise<User> {
        const user = await this.userRepository.findById(input.id);
        if (!user) {
            throw new UserNotFoundError();
        }

        assertValidPassword(input.temporaryPassword);
        user.resetPassword(await this.passwordHasher.hash(input.temporaryPassword));
        await this.userRepository.save(user);

        return user;
    }
}
