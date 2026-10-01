import type { RefreshToken as RefreshTokenRow } from '../../../generated/prisma/client.js';
import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';

export class RefreshTokenMapper {
    static toDomain(row: RefreshTokenRow): RefreshToken {
        return RefreshToken.restore({
            id: row.id,
            userId: row.userId,
            tokenHash: row.tokenHash,
            expiresAt: row.expiresAt,
            revokedAt: row.revokedAt,
            createdAt: row.createdAt,
        });
    }

    static toPersistence(token: RefreshToken) {
        return {
            id: token.id,
            userId: token.userId,
            tokenHash: token.tokenHash,
            expiresAt: token.expiresAt,
            revokedAt: token.revokedAt,
            createdAt: token.createdAt,
        };
    }
}
