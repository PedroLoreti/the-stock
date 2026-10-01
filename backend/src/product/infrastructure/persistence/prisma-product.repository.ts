import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { Page, skipOf } from '../../../shared/application/pagination.js';
import { ConcurrencyError } from '../../../shared/domain/concurrency.error.js';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { Product } from '../../domain/entities/product.entity.js';
import { FindAllProductsOptions, ProductRepository } from '../../domain/repositories/product.repository.js';
import { ProductMapper } from './product.mapper.js';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Lock otimista: o UPDATE só acontece se a linha ainda estiver na versão que foi lida.
     * Se outra operação gravou antes, nenhuma linha é afetada e lançamos ConcurrencyError.
     */
    async save(product: Product): Promise<void> {
        const { id, version, ...data } = ProductMapper.toPersistence(product);

        const updated = await this.prisma.db.product.updateMany({
            where: { id, version },
            data: { ...data, version: { increment: 1 } },
        });
        if (updated.count === 1) {
            return;
        }

        const exists = await this.prisma.db.product.findUnique({ where: { id }, select: { id: true } });
        if (exists) {
            throw new ConcurrencyError();
        }

        await this.prisma.db.product.create({ data: { id, version, ...data } });
    }

    async findById(id: string): Promise<Product | null> {
        const row = await this.prisma.db.product.findUnique({ where: { id } });
        return row ? ProductMapper.toDomain(row) : null;
    }

    async findBySku(sku: string): Promise<Product | null> {
        const row = await this.prisma.db.product.findUnique({ where: { sku } });
        return row ? ProductMapper.toDomain(row) : null;
    }

    async findManyByIds(ids: string[]): Promise<Product[]> {
        const rows = await this.prisma.db.product.findMany({ where: { id: { in: ids } } });
        return rows.map(ProductMapper.toDomain);
    }

    async findAll(options: FindAllProductsOptions): Promise<Page<Product>> {
        const search = options.search?.trim();
        const where: Prisma.ProductWhereInput = {
            ...(options.includeInactive ? {} : { active: true }),
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: 'insensitive' } },
                          { sku: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.db.product.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: skipOf(options),
                take: options.pageSize,
            }),
            this.prisma.db.product.count({ where }),
        ]);

        return { items: rows.map(ProductMapper.toDomain), page: options.page, pageSize: options.pageSize, total };
    }
}
