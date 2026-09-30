import { RefreshToken } from '../entities/refresh-token.entity.js';

export abstract class RefreshTokenRepository {
    abstract save(token: RefreshToken): Promise<void>;
    abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
    /** Encerra todas as sessões de um usuário (troca de senha, reuso de token detectado). */
    abstract revokeAllByUserId(userId: string, now: Date): Promise<void>;
}
