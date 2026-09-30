import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../user/application/ports/password-hasher.js';
import { User } from '../../../user/domain/entities/user.entity.js';
import { UserRepository } from '../../../user/domain/repositories/user.repository.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { IssuedTokens, TokenIssuer } from '../services/token-issuer.js';

export interface LoginInput {
    /** Email ou username. */
    login: string;
    password: string;
}

export interface LoginOutput extends IssuedTokens {
    user: User;
}

/**
 * Hash bcrypt válido de uma senha aleatória. Quando o login não existe, comparamos contra ele
 * mesmo assim, para o tempo de resposta não revelar quais logins estão cadastrados.
 */
const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO5f0r6XqW1fZbYwq7q1nqgPn1u0pI5lW';

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenIssuer: TokenIssuer,
    ) {}

    async execute(input: LoginInput): Promise<LoginOutput> {
        const user = await this.findByLogin(input.login);

        const passwordMatches = await this.passwordHasher.compare(
            input.password,
            user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );
        if (!user || !user.active || !passwordMatches) {
            throw new InvalidCredentialsError();
        }

        const tokens = await this.tokenIssuer.issueFor(user);
        return { ...tokens, user };
    }

    private findByLogin(login: string): Promise<User | null> {
        return User.isEmail(login)
            ? this.userRepository.findByEmail(User.normalizeEmail(login))
            : this.userRepository.findByUsername(User.normalizeUsername(login));
    }
}
