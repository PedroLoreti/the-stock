import { Global, Module } from '@nestjs/common';
import { UnitOfWork } from '../../application/unit-of-work.js';
import { PrismaService } from './prisma.service.js';
import { PrismaUnitOfWork } from './prisma-unit-of-work.js';

@Global()
@Module({
    providers: [PrismaService, { provide: UnitOfWork, useClass: PrismaUnitOfWork }],
    exports: [PrismaService, UnitOfWork],
})
export class PrismaModule {}
