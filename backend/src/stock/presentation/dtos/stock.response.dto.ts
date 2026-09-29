import { StockEntity } from '../../stock.entity.js';

export class StockSummaryResponseDTO {
    constructor(
        readonly id: string,
        readonly name: string,
    ) {}

    static fromEntity(stock: StockEntity): StockSummaryResponseDTO {
        return new StockSummaryResponseDTO(stock.id, stock.name);
    }
}

export class StockResponseDTO {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly description: string,
        readonly quantity: number,
        readonly code: number,
    ) {}

    static fromEntity(stock: StockEntity): StockResponseDTO {
        return new StockResponseDTO(stock.id, stock.name, stock.description, stock.quantity, stock.code);
    }
}
