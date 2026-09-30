import { Module } from '@nestjs/common';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case.js';
import { DeactivateProductUseCase } from './application/use-cases/deactivate-product.use-case.js';
import { GetProductUseCase } from './application/use-cases/get-product.use-case.js';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case.js';
import { ListStockMovementsUseCase } from './application/use-cases/list-stock-movements.use-case.js';
import { RegisterStockEntryUseCase } from './application/use-cases/register-stock-entry.use-case.js';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case.js';
import { ProductRepository } from './domain/repositories/product.repository.js';
import { StockMovementRepository } from './domain/repositories/stock-movement.repository.js';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository.js';
import { PrismaStockMovementRepository } from './infrastructure/persistence/prisma-stock-movement.repository.js';

@Module({
    providers: [
        { provide: ProductRepository, useClass: PrismaProductRepository },
        { provide: StockMovementRepository, useClass: PrismaStockMovementRepository },
        CreateProductUseCase,
        ListProductsUseCase,
        GetProductUseCase,
        UpdateProductUseCase,
        DeactivateProductUseCase,
        RegisterStockEntryUseCase,
        ListStockMovementsUseCase,
    ],
    exports: [ProductRepository, StockMovementRepository],
})
export class ProductModule {}
