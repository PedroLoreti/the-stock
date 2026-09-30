import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../../../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    /**
     * Guarda o client transacional enquanto um `runInTransaction` está em andamento,
     * para que os repositórios usem a transação sem receber nada por parâmetro.
     */
    private readonly transactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

    constructor() {
        super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    }

    /** Client a ser usado pelos repositórios: a transação ativa, se houver, ou o client normal. */
    get db(): Prisma.TransactionClient {
        return this.transactionStorage.getStore() ?? this;
    }

    runInTransaction<T>(work: () => Promise<T>): Promise<T> {
        return this.$transaction((tx) => this.transactionStorage.run(tx, work));
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
