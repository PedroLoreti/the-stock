import { Injectable } from '@nestjs/common';
import { User } from '../../../user/domain/entities/user.entity.js';
import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';
import { generateRefreshTokenSecret, hashRefreshTokenSecret } from '../../domain/refresh-token-secret.js';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.js';
import { AuthConfig } from '../ports/auth-config.js';
import { TokenService } from '../ports/token-service.js';

export interface IssuedTokens {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

/** Emite o par access + refresh. Usado pelo login, pelo refresh e pela troca de senha. */
@Injectable()
export class TokenIssuer {
    constructor(
        private readonly tokenService: TokenService,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly config: AuthConfig,
    ) {}

    async issueFor(user: User, now = new Date()): Promise<IssuedTokens> {
        const accessToken = await this.tokenService.signAccessToken({
            sub: user.id,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
        });

        const secret = generateRefreshTokenSecret();
        const expiresAt = new Date(now.getTime() + this.config.refreshTokenTtlMs);
        await this.refreshTokenRepository.save(
            RefreshToken.create(user.id, hashRefreshTokenSecret(secret), expiresAt, now),
        );

        return { accessToken, refreshToken: secret, refreshTokenExpiresAt: expiresAt };
    }
}
