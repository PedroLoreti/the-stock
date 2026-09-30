import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';
import { ProductMapper } from './product.mapper.js';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(product: Product): Promise<void> {
        const { id, ...data } = ProductMapper.toPersistence(product);
        await this.prisma.db.product.upsert({
            where: { id },
            create: { id, ...data },
            update: data,
        });
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

    async findAll(): Promise<Product[]> {
        const rows = await this.prisma.db.product.findMany({ orderBy: { name: 'asc' } });
        return rows.map(ProductMapper.toDomain);
    }
}
