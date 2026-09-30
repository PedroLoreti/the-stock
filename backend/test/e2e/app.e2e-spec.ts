import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { setupApp } from '../../src/app-setup.js';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service.js';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

describe('the-stock API (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const validProduct = { name: 'Caneta Azul', description: 'Esferográfica', sku: 'TS-1', price: 2.5, quantity: 10 };

    async function createProduct(overrides: Partial<typeof validProduct> = {}) {
        const response = await request(app.getHttpServer())
            .post('/products')
            .send({ ...validProduct, ...overrides })
            .expect(201);
        return response.body as { id: string; quantity: number };
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = setupApp(moduleRef.createNestApplication());
        await app.listen(0); // porta aleatoria: o supertest reaproveita o servidor entre as requisicoes
        prisma = app.get(PrismaService);
    });

    beforeEach(async () => {
        await prisma.db.$executeRawUnsafe(
            'TRUNCATE TABLE "stock_movements", "sale_items", "sales", "products" RESTART IDENTITY CASCADE',
        );
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /products', () => {
        it('creates a product and its initial ENTRY movement', async () => {
            const product = await createProduct();

            expect(product).toMatchObject({ ...validProduct, active: true });

            const movements = await request(app.getHttpServer()).get(`/products/${product.id}/movements`).expect(200);
            expect(movements.body).toEqual([expect.objectContaining({ type: 'ENTRY', quantity: 10, saleId: null })]);
        });

        it('returns 409 for a duplicated sku', async () => {
            await createProduct();

            const response = await request(app.getHttpServer()).post('/products').send(validProduct).expect(409);
            expect(response.body.error).toBe('SkuAlreadyExistsError');
        });

        it('returns 400 for a sku outside the TS-<number> format', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({ ...validProduct, sku: 'ABC-1' })
                .expect(400);
            expect(response.body.error).toBe('InvalidProductError');
        });

        it('returns 400 with every validation message for a malformed body', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({ name: '', sku: 'TS-2', price: -1, quantity: 1.5, extra: true })
                .expect(400);

            expect(response.body.message).toEqual(
                expect.arrayContaining([
                    'property extra should not exist',
                    'Name is required',
                    'Price must be greater than zero',
                    'Quantity must be an integer',
                ]),
            );
        });
    });

    describe('products', () => {
        it('GET /products/:id returns 404 for an unknown id and 400 for a malformed one', async () => {
            await request(app.getHttpServer()).get(`/products/${NIL_UUID}`).expect(404);
            await request(app.getHttpServer()).get('/products/abc').expect(400);
        });

        it('PATCH /products/:id updates name, description and price only', async () => {
            const product = await createProduct();

            const response = await request(app.getHttpServer())
                .patch(`/products/${product.id}`)
                .send({ name: 'Caneta Preta', price: 3 })
                .expect(200);
            expect(response.body).toMatchObject({ name: 'Caneta Preta', price: 3, quantity: 10 });

            await request(app.getHttpServer()).patch(`/products/${product.id}`).send({ quantity: 99 }).expect(400);
        });

        it('POST /products/:id/entries adds stock and records the movement', async () => {
            const product = await createProduct();

            const response = await request(app.getHttpServer())
                .post(`/products/${product.id}/entries`)
                .send({ quantity: 5 })
                .expect(200);
            expect(response.body.quantity).toBe(15);
        });

        it('DELETE /products/:id deactivates the product and blocks further entries', async () => {
            const product = await createProduct();

            const response = await request(app.getHttpServer()).delete(`/products/${product.id}`).expect(200);
            expect(response.body.active).toBe(false);

            await request(app.getHttpServer())
                .post(`/products/${product.id}/entries`)
                .send({ quantity: 1 })
                .expect(422);
        });
    });

    describe('sales', () => {
        it('sells, lowers the stock, records movements and cancels within the window', async () => {
            const product = await createProduct({ quantity: 10 });

            const sale = await request(app.getHttpServer())
                .post('/sales')
                .send({ items: [{ productId: product.id, quantity: 4 }] })
                .expect(201);
            expect(sale.body).toMatchObject({ status: 'COMPLETED', total: 10 });
            expect(sale.body.items[0]).toMatchObject({
                productId: product.id,
                quantity: 4,
                unitPrice: 2.5,
                subtotal: 10,
            });

            const afterSale = await request(app.getHttpServer()).get(`/products/${product.id}`).expect(200);
            expect(afterSale.body.quantity).toBe(6);

            const cancelled = await request(app.getHttpServer()).post(`/sales/${sale.body.id}/cancel`).expect(200);
            expect(cancelled.body.status).toBe('CANCELLED');
            expect(cancelled.body.cancelledAt).not.toBeNull();

            const afterCancel = await request(app.getHttpServer()).get(`/products/${product.id}`).expect(200);
            expect(afterCancel.body.quantity).toBe(10);

            await request(app.getHttpServer()).post(`/sales/${sale.body.id}/cancel`).expect(422);

            const movements = await request(app.getHttpServer()).get(`/products/${product.id}/movements`).expect(200);
            expect(movements.body.map((m: { type: string }) => m.type)).toEqual(['SALE_CANCELLATION', 'SALE', 'ENTRY']);
        });

        it('returns 422 when the stock is insufficient and writes nothing', async () => {
            const product = await createProduct({ quantity: 3 });

            const response = await request(app.getHttpServer())
                .post('/sales')
                .send({ items: [{ productId: product.id, quantity: 4 }] })
                .expect(422);
            expect(response.body.error).toBe('InsufficientStockError');

            const sales = await request(app.getHttpServer()).get('/sales').expect(200);
            expect(sales.body).toHaveLength(0);
        });

        it('validates the cart body', async () => {
            await request(app.getHttpServer()).post('/sales').send({ items: [] }).expect(400);
            await request(app.getHttpServer())
                .post('/sales')
                .send({ items: [{ productId: 'nope', quantity: 0 }] })
                .expect(400);
        });

        it('GET /sales/:id returns 404 for an unknown sale', async () => {
            await request(app.getHttpServer()).get(`/sales/${NIL_UUID}`).expect(404);
        });

        it('never oversells under concurrent sales of the same product', async () => {
            const product = await createProduct({ quantity: 10 });

            const responses = await Promise.all(
                Array.from({ length: 20 }, () =>
                    request(app.getHttpServer())
                        .post('/sales')
                        .send({ items: [{ productId: product.id, quantity: 1 }] }),
                ),
            );

            const statuses = responses.map((r) => r.status);
            expect(statuses.filter((s) => s === 201)).toHaveLength(10);
            expect(statuses.every((s) => [201, 409, 422].includes(s))).toBe(true);

            const after = await request(app.getHttpServer()).get(`/products/${product.id}`).expect(200);
            expect(after.body.quantity).toBe(0);

            const movements = await request(app.getHttpServer()).get(`/products/${product.id}/movements`).expect(200);
            expect(movements.body.filter((m: { type: string }) => m.type === 'SALE')).toHaveLength(10);
        });
    });
});
