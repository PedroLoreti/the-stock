import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import { StockMovementRepository } from '../../domain/repositories/stock-movement.repository.js';
import { StockMovementMapper } from './stock-movement.mapper.js';

@Injectable()
export class PrismaStockMovementRepository implements StockMovementRepository {
    constructor(private readonly prisma: PrismaService) {}

    async save(movement: StockMovement): Promise<void> {
        await this.prisma.db.stockMovement.create({ data: StockMovementMapper.toPersistence(movement) });
    }

    async findByProductId(productId: string): Promise<StockMovement[]> {
        const rows = await this.prisma.db.stockMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(StockMovementMapper.toDomain);
    }
}
