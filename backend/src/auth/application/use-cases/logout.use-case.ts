import { Injectable } from '@nestjs/common';
import { hashRefreshTokenSecret } from '../../domain/refresh-token-secret.js';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.js';

export interface LogoutInput {
    refreshToken: string;
}

/** Idempotente: um token desconhecido não é erro (o resultado é o mesmo: sessão encerrada). */
@Injectable()
export class LogoutUseCase {
    constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

    async execute(input: LogoutInput): Promise<void> {
        const stored = await this.refreshTokenRepository.findByTokenHash(hashRefreshTokenSecret(input.refreshToken));
        if (stored) {
            await this.refreshTokenRepository.delete(stored.id);
        }
    }
}
