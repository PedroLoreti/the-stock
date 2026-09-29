import { Injectable } from '@nestjs/common';
import { Stock } from '../../domain/entities/stock.entity.js';
import { StockRepository } from '../../domain/repositories/stock.repository.js';
import { CodeAlreadyExistsError } from '../../domain/errors/code-already-exists.error.js';

export interface CreateStockInput {
    name: string;
    description: string;
    quantity: number;
    code: number;
}

@Injectable()
export class CreateStockUseCase {
    constructor(private readonly stockRepository: StockRepository) {}

    async execute(input: CreateStockInput): Promise<Stock> {
        const codeInUse = await this.stockRepository.findByCode(input.code);
        if (codeInUse) {
            throw new CodeAlreadyExistsError();
        }

        const stock = Stock.create(input);
        await this.stockRepository.save(stock);

        return stock;
    }
}
