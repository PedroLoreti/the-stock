import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { UserMapper } from './user.mapper.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(user: User): Promise<void> {
        const { id, ...data } = UserMapper.toPersistence(user);
        await this.prisma.db.user.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    async findById(id: string): Promise<User | null> {
        const row = await this.prisma.db.user.findUnique({ where: { id } });
        return row ? UserMapper.toDomain(row) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const row = await this.prisma.db.user.findUnique({ where: { username } });
        return row ? UserMapper.toDomain(row) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const row = await this.prisma.db.user.findUnique({ where: { email } });
        return row ? UserMapper.toDomain(row) : null;
    }

    async findAll(options: { includeInactive?: boolean } = {}): Promise<User[]> {
        const rows = await this.prisma.db.user.findMany({
            where: options.includeInactive ? undefined : { active: true },
            orderBy: { name: 'asc' },
        });
        return rows.map(UserMapper.toDomain);
    }

    count(): Promise<number> {
        return this.prisma.db.user.count();
    }
}
