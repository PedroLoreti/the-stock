import { Injectable } from '@nestjs/common';
import { Stock } from '../../domain/entities/stock.entity.js';
import { StockRepository } from '../../domain/repositories/stock.repository.js';
import { StockNotFoundError } from '../../domain/errors/stock-not-found.error.js';

export interface RemoveStockQuantityInput {
    id: string;
    amount: number;
}

@Injectable()
export class RemoveStockQuantityUseCase {
    constructor(private readonly stockRepository: StockRepository) {}

    async execute(input: RemoveStockQuantityInput): Promise<Stock> {
        const stock = await this.stockRepository.findById(input.id);
        if (!stock) {
            throw new StockNotFoundError();
        }

        stock.removeQuantity(input.amount);
        await this.stockRepository.save(stock);

        return stock;
    }
}
