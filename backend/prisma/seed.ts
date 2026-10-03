/**
 * Dados de exemplo: `npm run db:seed` (ou `npx prisma db seed`). No Docker roda a cada `up`.
 *
 * Só insere num banco sem produtos: se já existir algum, não faz nada (nunca apaga dados).
 * Cria 3 produtos (cada um com a entrada inicial de estoque), 2 reposições e 3 vendas,
 * registradas pelo admin que a API cria no primeiro boot. Senhas não são alteradas.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const PRODUCTS = [
    {
        sku: 'TS-1',
        name: 'Wireless Mouse',
        brand: 'Logitech',
        description: 'Compact 2.4GHz mouse with silent clicks',
        price: 89.9,
        quantity: 20,
        minStock: 5,
    },
    {
        sku: 'TS-2',
        name: 'Mechanical Keyboard',
        brand: 'Keychron',
        description: 'TKL layout, brown switches, ABNT2',
        price: 349.0,
        quantity: 8,
        minStock: 3,
    },
    // Termina em estoque baixo (4 ≤ 5) para o aviso aparecer no dashboard.
    {
        sku: 'TS-3',
        name: 'USB-C Hub 7-in-1',
        brand: 'Baseus',
        description: 'HDMI 4K, 3x USB-A, SD/microSD, PD 100W',
        price: 199.9,
        quantity: 3,
        minStock: 5,
    },
];

/** Reposições, depois do cadastro e antes das vendas. */
const ENTRIES = [
    { sku: 'TS-2', quantity: 4 },
    { sku: 'TS-3', quantity: 3 },
];

/** Em ordem cronológica. */
const SALES = [
    {
        hoursAgo: 30,
        items: [
            { sku: 'TS-1', quantity: 2 },
            { sku: 'TS-3', quantity: 2 },
        ],
    },
    { hoursAgo: 20, items: [{ sku: 'TS-2', quantity: 1 }] },
    {
        hoursAgo: 2,
        items: [
            { sku: 'TS-1', quantity: 3 },
            { sku: 'TS-2', quantity: 2 },
        ],
    },
];

function hoursAgo(hours: number): Date {
    return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

async function main(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set (see .env.example)');
    }

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

    try {
        if ((await prisma.product.count()) > 0) {
            console.log('Seed skipped: the database already has products.');
            return;
        }

        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });
        if (!admin) {
            throw new Error('No admin user found: start the API once so it creates the initial admin');
        }

        await prisma.$transaction(async (tx) => {
            const stock = new Map<string, { id: string; price: number; quantity: number }>();

            for (const product of PRODUCTS) {
                const id = randomUUID();
                const createdAt = hoursAgo(72);
                stock.set(product.sku, { id, price: product.price, quantity: product.quantity });
                await tx.product.create({ data: { id, ...product, createdAt } });
                await tx.stockMovement.create({
                    data: { id: randomUUID(), productId: id, type: 'ENTRY', quantity: product.quantity, createdAt },
                });
            }

            for (const entry of ENTRIES) {
                const product = stock.get(entry.sku)!;
                product.quantity += entry.quantity;
                await tx.stockMovement.create({
                    data: {
                        id: randomUUID(),
                        productId: product.id,
                        type: 'ENTRY',
                        quantity: entry.quantity,
                        createdAt: hoursAgo(48),
                    },
                });
            }

            for (const sale of SALES) {
                const saleId = randomUUID();
                const createdAt = hoursAgo(sale.hoursAgo);
                const items = sale.items.map(({ sku, quantity }) => {
                    const product = stock.get(sku)!;
                    product.quantity -= quantity;
                    return {
                        id: randomUUID(),
                        productId: product.id,
                        quantity,
                        unitPrice: product.price,
                        subtotal: roundMoney(quantity * product.price),
                    };
                });

                await tx.sale.create({
                    data: {
                        id: saleId,
                        userId: admin.id,
                        total: roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0)),
                        createdAt,
                        items: { create: items },
                    },
                });
                for (const item of items) {
                    await tx.stockMovement.create({
                        data: {
                            id: randomUUID(),
                            productId: item.productId,
                            type: 'SALE',
                            quantity: item.quantity,
                            saleId,
                            createdAt,
                        },
                    });
                }
            }

            for (const { id, quantity } of stock.values()) {
                await tx.product.update({ where: { id }, data: { quantity } });
            }
        });

        console.log(
            `Seed applied: ${PRODUCTS.length} products, ${ENTRIES.length} stock entries, ${SALES.length} sales.`,
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
