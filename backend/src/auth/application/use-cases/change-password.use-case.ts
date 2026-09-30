import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../shared/application/unit-of-work.js';
import { PasswordHasher } from '../../../user/application/ports/password-hasher.js';
import { User } from '../../../user/domain/entities/user.entity.js';
import { InvalidPasswordError } from '../../../user/domain/errors/invalid-password.error.js';
import { UserNotFoundError } from '../../../user/domain/errors/user-not-found.error.js';
import { assertValidPassword } from '../../../user/domain/password-policy.js';
import { UserRepository } from '../../../user/domain/repositories/user.repository.js';
import { WrongCurrentPasswordError } from '../../domain/errors/wrong-current-password.error.js';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.js';
import { IssuedTokens, TokenIssuer } from '../services/token-issuer.js';

export interface ChangePasswordInput {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

export interface ChangePasswordOutput extends IssuedTokens {
    user: User;
}

/**
 * Troca a senha do próprio usuário (inclusive no fluxo obrigatório do primeiro login).
 * Encerra todas as outras sessões e devolve um par de tokens novo, já sem a flag de troca.
 */
@Injectable()
export class ChangePasswordUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenIssuer: TokenIssuer,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async execute(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        if (!(await this.passwordHasher.compare(input.currentPassword, user.passwordHash))) {
            throw new WrongCurrentPasswordError();
        }

        assertValidPassword(input.newPassword);
        if (input.newPassword === input.currentPassword) {
            throw new InvalidPasswordError('New password must be different from the current one');
        }

        user.changePassword(await this.passwordHasher.hash(input.newPassword));
        const now = new Date();

        return this.unitOfWork.run(async () => {
            await this.userRepository.save(user);
            await this.refreshTokenRepository.revokeAllByUserId(user.id, now);
            const tokens = await this.tokenIssuer.issueFor(user, now);
            return { ...tokens, user };
        });
    }
}
