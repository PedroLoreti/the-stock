import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.js';
import { RefreshTokenMapper } from './refresh-token.mapper.js';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(token: RefreshToken): Promise<void> {
        const { id, ...data } = RefreshTokenMapper.toPersistence(token);
        await this.prisma.db.refreshToken.upsert({
            where: { id },
            create: { id, ...data },
            update: { revokedAt: data.revokedAt },
        });
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const row = await this.prisma.db.refreshToken.findUnique({ where: { tokenHash } });
        return row ? RefreshTokenMapper.toDomain(row) : null;
    }

    async revokeAllByUserId(userId: string, now: Date): Promise<void> {
        await this.prisma.db.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: now },
        });
    }
}
