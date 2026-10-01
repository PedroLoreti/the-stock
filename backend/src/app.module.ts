import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ProductModule } from './product/product.module.js';
import { SaleModule } from './sale/sale.module.js';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';

@Module({
    imports: [PrismaModule, UserModule, AuthModule, ProductModule, SaleModule],
})
export class AppModule {}
