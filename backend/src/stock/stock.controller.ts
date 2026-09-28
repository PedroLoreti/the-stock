import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { StockRepository } from './stock.repository.js';
import { CreateStockDto } from './dto/createStock.dto.js';
import { StockEntity } from './stock.entity.js';
import { v4 as uuid } from 'uuid';
import { ListStockDto } from './dto/listStock.dto.js';
import { UpdateStockDto } from './dto/updateStock.dto.js';
@Controller('/stock')
export class StockController {
  constructor(private stockRepository: StockRepository) {}
  @Post()
  async createStock(@Body() dataStock: CreateStockDto) {
    const stockEntity = new StockEntity();
    stockEntity.id = uuid();
    stockEntity.name = dataStock.name;
    stockEntity.description = dataStock.description;
    stockEntity.quantity = dataStock.quantity;
    stockEntity.code = dataStock.code;

    await this.stockRepository.save(stockEntity);
    return {
      stock: new ListStockDto(stockEntity.id, stockEntity.name),
      message: 'Stock created successfully',
    };
  }

  @Get()
  async getStocks() {
    const stocksSaved = await this.stockRepository.list();
    const stocksList = stocksSaved.map(
      (stock) => new ListStockDto(stock.id, stock.name),
    );
    return stocksList;
  }

  @Put('/:id')
  async updateStock(@Param('id') id: string, @Body() dataUpdateStock: UpdateStockDto) {
    const stockUpdated = await this.stockRepository.update(id, dataUpdateStock);
    return {
      stock: stockUpdated,
      message: 'Stock updated successfully',
    }
  }

  @Delete('/:id')
  async deleteStock(@Param('id') id: string) {
    const stockDeleted = await this.stockRepository.delete(id);

    return {
      stock: stockDeleted,
      message: 'Stock deleted successfully',
    };
  }
}
