import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ProductModule } from './product/product.module.js';
import { SaleModule } from './sale/sale.module.js';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
    imports: [
        // Distributed tracing, auto-correlated logs, request/job metrics, error
        // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
        ObserveModule.forRoot({
            appKey: 'YOUR_APP_KEY',
            appSecret: 'YOUR_APP_SECRET',
            serviceId: 'the-stock',
        }),
        PrismaModule,
        ProductModule,
        SaleModule,
    ],
})
export class AppModule {}
