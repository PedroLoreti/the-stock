import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { StockRepository } from '../../stock.repository.js';
import { StockEntity } from '../../stock.entity.js';
import { CreateStockRequestDTO } from '../dtos/create-stock.request.dto.js';
import { UpdateStockRequestDTO } from '../dtos/update-stock.request.dto.js';
import { StockResponseDTO, StockSummaryResponseDTO } from '../dtos/stock.response.dto.js';
import { v4 as uuid } from 'uuid';

@Controller('/stock')
export class StockController {
    constructor(private stockRepository: StockRepository) {}
    @Post()
    async createStock(@Body() dataStock: CreateStockRequestDTO) {
        const stockEntity = new StockEntity();
        stockEntity.id = uuid();
        stockEntity.name = dataStock.name;
        stockEntity.description = dataStock.description;
        stockEntity.quantity = dataStock.quantity;
        stockEntity.code = dataStock.code;

        await this.stockRepository.save(stockEntity);
        return {
            stock: StockSummaryResponseDTO.fromEntity(stockEntity),
            message: 'Stock created successfully',
        };
    }

    @Get()
    async getStocks() {
        const stocksSaved = await this.stockRepository.list();
        return stocksSaved.map(StockResponseDTO.fromEntity);
    }

    @Put('/:id')
    async updateStock(@Param('id') id: string, @Body() dataUpdateStock: UpdateStockRequestDTO) {
        const stockUpdated = await this.stockRepository.update(id, dataUpdateStock);
        return {
            stock: StockSummaryResponseDTO.fromEntity(stockUpdated),
            message: 'Stock updated successfully',
        };
    }

    @Delete('/:id')
    async deleteStock(@Param('id') id: string) {
        const stockDeleted = await this.stockRepository.delete(id);

        return {
            stock: StockSummaryResponseDTO.fromEntity(stockDeleted),
            message: 'Stock deleted successfully',
        };
    }
}
