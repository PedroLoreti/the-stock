import { RefreshToken, RefreshTokenProps } from '../../src/auth/domain/entities/refresh-token.entity.js';
import { RefreshTokenRepository } from '../../src/auth/domain/repositories/refresh-token.repository.js';
import { Snapshotable } from './snapshotable.js';

function toProps(token: RefreshToken): RefreshTokenProps {
    return {
        id: token.id,
        userId: token.userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
        revokedAt: token.revokedAt,
        createdAt: token.createdAt,
    };
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository, Snapshotable {
    private rows = new Map<string, RefreshTokenProps>();

    async save(token: RefreshToken): Promise<void> {
        this.rows.set(token.id, toProps(token));
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const row = [...this.rows.values()].find((item) => item.tokenHash === tokenHash);
        return row ? RefreshToken.restore({ ...row }) : null;
    }

    async revokeAllByUserId(userId: string, now: Date): Promise<void> {
        for (const row of this.rows.values()) {
            if (row.userId === userId && row.revokedAt === null) {
                row.revokedAt = now;
            }
        }
    }

    /** Tokens ainda utilizáveis de um usuário. Útil nas asserções. */
    activeCountFor(userId: string, now = new Date()): number {
        return [...this.rows.values()].filter(
            (row) => row.userId === userId && row.revokedAt === null && row.expiresAt.getTime() > now.getTime(),
        ).length;
    }

    snapshot(): unknown {
        return new Map([...this.rows].map(([id, row]) => [id, { ...row }]));
    }

    restore(snapshot: unknown): void {
        this.rows = snapshot as Map<string, RefreshTokenProps>;
    }
}
