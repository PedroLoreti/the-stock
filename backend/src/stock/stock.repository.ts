import { Injectable } from '@nestjs/common';
import { StockEntity } from './stock.entity.js';

@Injectable()
export class StockRepository {
  private stocks: StockEntity[] = [];

  private findStockById(id: string) {
    const possibleStock = this.stocks.find((stock) => stock.id === id);

    if (!possibleStock) {
      throw new Error('Stock not found');
    }

    return possibleStock;
  }

  async save(stock: StockEntity) {
    this.stocks.push(stock);
  }

  async list() {
    return this.stocks;
  }

  async codeExists(code: number) {
    const possibleCode = this.stocks.find((stock) => stock.code === code);
    return possibleCode !== undefined;
  }

  async update(id: string, dataUpdateStock: Partial<StockEntity>) {
    const stock = this.findStockById(id);

    const { id: _id, ...updatableFields } = dataUpdateStock;
    Object.assign(stock, updatableFields);

    return stock;
  }

  async delete(id: string) {
    const stock = this.findStockById(id);
    this.stocks = this.stocks.filter((stockItem) => stockItem.id !== stock.id);
    return stock;
  }
}
