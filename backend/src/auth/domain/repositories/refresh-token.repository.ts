import { RefreshToken } from '../entities/refresh-token.entity.js';

/**
 * Dois destinos diferentes para um token:
 * - `save` de um token revogado: consumido pela rotação; fica guardado para detectar reuso (roubo).
 * - `delete*`: sessão encerrada de propósito (logout, troca de senha, usuário desativado);
 *   apresentar o token depois é só um 401 comum, sem derrubar as outras sessões.
 */
export abstract class RefreshTokenRepository {
    abstract save(token: RefreshToken): Promise<void>;
    abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
    abstract delete(id: string): Promise<void>;
    abstract deleteAllByUserId(userId: string): Promise<void>;
}
