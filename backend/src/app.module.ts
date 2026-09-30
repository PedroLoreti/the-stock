import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module.js';
import { SaleModule } from './sale/sale.module.js';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module.js';

@Module({
    imports: [PrismaModule, ProductModule, SaleModule],
})
export class AppModule {}
