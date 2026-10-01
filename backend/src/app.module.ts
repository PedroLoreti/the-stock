import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { ProductModule } from './product/product.module.js';
import { SaleModule } from './sale/sale.module.js';
import { optionalEnv } from './shared/infrastructure/config/env.js';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';

@Module({
    imports: [
        // Limite geral por IP; o login tem um limite próprio, bem menor (ver AuthController).
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: Number(optionalEnv('THROTTLE_LIMIT', '300')) }]),
        PrismaModule,
        UserModule,
        AuthModule,
        ProductModule,
        SaleModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
