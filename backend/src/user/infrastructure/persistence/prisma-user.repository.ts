import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { Page, skipOf } from '../../../shared/application/pagination.js';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { User } from '../../domain/entities/user.entity.js';
import { FindAllUsersOptions, UserRepository } from '../../domain/repositories/user.repository.js';
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

    async findAll(options: FindAllUsersOptions): Promise<Page<User>> {
        const search = options.search?.trim();
        const where: Prisma.UserWhereInput = {
            ...(options.includeInactive ? {} : { active: true }),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: 'insensitive' } },
                          { username: { contains: search, mode: 'insensitive' } },
                          { email: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.db.user.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: skipOf(options),
                take: options.pageSize,
            }),
            this.prisma.db.user.count({ where }),
        ]);

        return { items: rows.map(UserMapper.toDomain), page: options.page, pageSize: options.pageSize, total };
    }

    count(): Promise<number> {
        return this.prisma.db.user.count();
    }
}
