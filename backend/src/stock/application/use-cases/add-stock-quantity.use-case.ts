import { Injectable } from '@nestjs/common';
import { Stock } from '../../domain/entities/stock.entity.js';
import { StockRepository } from '../../domain/repositories/stock.repository.js';
import { StockNotFoundError } from '../../domain/errors/stock-not-found.error.js';

export interface AddStockQuantityInput {
    id: string;
    amount: number;
}

@Injectable()
export class AddStockQuantityUseCase {
    constructor(private readonly stockRepository: StockRepository) {}

    async execute(input: AddStockQuantityInput): Promise<Stock> {
        const stock = await this.stockRepository.findById(input.id);
        if (!stock) {
            throw new StockNotFoundError();
        }

        stock.addQuantity(input.amount);
        await this.stockRepository.save(stock);

        return stock;
    }
}
