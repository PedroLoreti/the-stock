import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../shared/application/unit-of-work.js';
import { User } from '../../../user/domain/entities/user.entity.js';
import { UserRepository } from '../../../user/domain/repositories/user.repository.js';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token.error.js';
import { hashRefreshTokenSecret } from '../../domain/refresh-token-secret.js';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.js';
import { IssuedTokens, TokenIssuer } from '../services/token-issuer.js';

export interface RefreshTokensInput {
    refreshToken: string;
}

export interface RefreshTokensOutput extends IssuedTokens {
    user: User;
}

/**
 * Rotação de refresh token: cada refresh consome o token atual (que fica guardado como
 * revogado) e emite um par novo. Se um token já consumido for apresentado de novo, alguém
 * o roubou (ou o cliente está dessincronizado); por segurança todas as sessões do usuário caem.
 */
@Injectable()
export class RefreshTokensUseCase {
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly userRepository: UserRepository,
        private readonly tokenIssuer: TokenIssuer,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async execute(input: RefreshTokensInput): Promise<RefreshTokensOutput> {
        const now = new Date();
        const stored = await this.refreshTokenRepository.findByTokenHash(hashRefreshTokenSecret(input.refreshToken));
        if (!stored) {
            throw new InvalidRefreshTokenError();
        }

        if (stored.isRevoked()) {
            await this.refreshTokenRepository.deleteAllByUserId(stored.userId);
            throw new InvalidRefreshTokenError();
        }
        if (stored.isExpired(now)) {
            throw new InvalidRefreshTokenError();
        }

        const user = await this.userRepository.findById(stored.userId);
        if (!user || !user.active) {
            await this.refreshTokenRepository.deleteAllByUserId(stored.userId);
            throw new InvalidRefreshTokenError();
        }

        return this.unitOfWork.run(async () => {
            stored.revoke(now);
            await this.refreshTokenRepository.save(stored);
            const tokens = await this.tokenIssuer.issueFor(user, now);
            return { ...tokens, user };
        });
    }
}
