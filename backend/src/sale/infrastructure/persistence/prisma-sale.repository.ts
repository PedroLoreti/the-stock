import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';
import { SALE_INCLUDE, SaleMapper } from './sale.mapper.js';

@Injectable()
export class PrismaSaleRepository implements SaleRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(sale: Sale): Promise<void> {
        const { id, items, ...data } = SaleMapper.toPersistence(sale);
        // Os itens são imutáveis: só entram no create. No update muda apenas status/cancelledAt.
        await this.prisma.db.sale.upsert({
            where: { id },
            create: { id, ...data, items: { create: items } },
            update: { status: data.status, cancelledAt: data.cancelledAt },
        });
    }

    async findById(id: string): Promise<Sale | null> {
        const row = await this.prisma.db.sale.findUnique({ where: { id }, include: SALE_INCLUDE });
        return row ? SaleMapper.toDomain(row) : null;
    }

    async findAll(): Promise<Sale[]> {
        const rows = await this.prisma.db.sale.findMany({
            include: SALE_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(SaleMapper.toDomain);
    }
}
