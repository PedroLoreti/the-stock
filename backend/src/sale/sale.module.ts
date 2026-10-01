import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module.js';
import { UserModule } from '../user/user.module.js';
import { CancelSaleUseCase } from './application/use-cases/cancel-sale.use-case.js';
import { CreateSaleUseCase } from './application/use-cases/create-sale.use-case.js';
import { GetSaleUseCase } from './application/use-cases/get-sale.use-case.js';
import { ListSalesUseCase } from './application/use-cases/list-sales.use-case.js';
import { SaleRepository } from './domain/repositories/sale.repository.js';
import { PrismaSaleRepository } from './infrastructure/persistence/prisma-sale.repository.js';
import { SaleController } from './presentation/controllers/sale.controller.js';

@Module({
    imports: [ProductModule, UserModule],
    controllers: [SaleController],
    providers: [
        { provide: SaleRepository, useClass: PrismaSaleRepository },
        CreateSaleUseCase,
        CancelSaleUseCase,
        GetSaleUseCase,
        ListSalesUseCase,
    ],
})
export class SaleModule {}
