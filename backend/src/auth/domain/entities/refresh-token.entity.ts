import { randomUUID } from 'node:crypto';

export interface RefreshTokenProps {
    id: string;
    userId: string;
    /** Só o hash do segredo é guardado; o segredo em si vai para o cliente e nunca é persistido. */
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
}

export class RefreshToken {
    private constructor(private props: RefreshTokenProps) {}

    static create(userId: string, tokenHash: string, expiresAt: Date, now = new Date()): RefreshToken {
        return new RefreshToken({
            id: randomUUID(),
            userId,
            tokenHash,
            expiresAt,
            revokedAt: null,
            createdAt: now,
        });
    }

    static restore(props: RefreshTokenProps): RefreshToken {
        return new RefreshToken(props);
    }

    revoke(now = new Date()): void {
        if (!this.props.revokedAt) {
            this.props.revokedAt = now;
        }
    }

    isRevoked(): boolean {
        return this.props.revokedAt !== null;
    }

    isExpired(now = new Date()): boolean {
        return now.getTime() >= this.props.expiresAt.getTime();
    }

    isUsable(now = new Date()): boolean {
        return !this.isRevoked() && !this.isExpired(now);
    }

    get id() {
        return this.props.id;
    }
    get userId() {
        return this.props.userId;
    }
    get tokenHash() {
        return this.props.tokenHash;
    }
    get expiresAt() {
        return this.props.expiresAt;
    }
    get revokedAt() {
        return this.props.revokedAt;
    }
    get createdAt() {
        return this.props.createdAt;
    }
}
