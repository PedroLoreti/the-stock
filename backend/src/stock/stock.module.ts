import { Module } from '@nestjs/common';
import { StockController } from './presentation/controllers/stock.controller.js';
import { StockRepository } from './stock.repository.js';
import { CodeIsUniqueValidator } from './validation/code-is-unique.validator.js';

@Module({
  controllers: [StockController],
  providers: [StockRepository, CodeIsUniqueValidator],
})
export class StockModule {}
