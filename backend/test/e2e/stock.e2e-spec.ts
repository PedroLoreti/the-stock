import { INestApplication } from '@nestjs/common';
import { UserRole } from '../../src/user/domain/entities/user.entity.js';
import {
    api,
    bearer,
    createTestApp,
    createUserSession,
    NIL_UUID,
    seedAdmin,
    Session,
    truncateAll,
    truncateStock,
} from './helpers.js';

describe('products and sales (e2e)', () => {
    let app: INestApplication;
    let admin: Session;
    let management: Session;
    let seller: Session;

    const validProduct = { name: 'Caneta Azul', description: 'Esferográfica', sku: 'TS-1', price: 2.5, quantity: 10 };

    async function createProduct(overrides: Partial<typeof validProduct> = {}, as: Session = management) {
        const response = await api(app)
            .post('/products')
            .set(bearer(as))
            .send({ ...validProduct, ...overrides })
            .expect(201);
        return response.body as { id: string; quantity: number };
    }

    beforeAll(async () => {
        app = await createTestApp();
        await truncateAll(app);
        admin = await seedAdmin(app);
        management = await createUserSession(app, admin, UserRole.MANAGEMENT);
        seller = await createUserSession(app, admin, UserRole.SELLER);
    });

    beforeEach(async () => {
        await truncateStock(app);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('roles', () => {
        it('sellers can read products but not change them', async () => {
            const product = await createProduct();

            await api(app).get('/products').set(bearer(seller)).expect(200);
            await api(app).get(`/products/${product.id}`).set(bearer(seller)).expect(200);
            await api(app).get(`/products/${product.id}/movements`).set(bearer(seller)).expect(200);

            await api(app).post('/products').set(bearer(seller)).send(validProduct).expect(403);
            await api(app).patch(`/products/${product.id}`).set(bearer(seller)).send({ name: 'x' }).expect(403);
            await api(app).delete(`/products/${product.id}`).set(bearer(seller)).expect(403);
            await api(app)
                .post(`/products/${product.id}/entries`)
                .set(bearer(seller))
                .send({ quantity: 1 })
                .expect(403);
        });

        it('only administrators see and restore inactive products', async () => {
            const product = await createProduct();
            await api(app).delete(`/products/${product.id}`).set(bearer(management)).expect(200);

            const forManagement = await api(app).get('/products').set(bearer(management)).expect(200);
            expect(forManagement.body).toHaveLength(0);
            await api(app).get('/products?includeInactive=true').set(bearer(management)).expect(403);
            await api(app).get('/products?includeInactive=true').set(bearer(seller)).expect(403);

            const forAdmin = await api(app).get('/products?includeInactive=true').set(bearer(admin)).expect(200);
            expect(forAdmin.body).toEqual([expect.objectContaining({ id: product.id, active: false })]);

            await api(app).post(`/products/${product.id}/restore`).set(bearer(management)).expect(403);
            const restored = await api(app).post(`/products/${product.id}/restore`).set(bearer(admin)).expect(200);
            expect(restored.body.active).toBe(true);
        });
    });

    describe('POST /products', () => {
        it('creates a product and its initial ENTRY movement', async () => {
            const product = await createProduct();

            expect(product).toMatchObject({ ...validProduct, active: true });

            const movements = await api(app)
                .get(`/products/${product.id}/movements`)
                .set(bearer(management))
                .expect(200);
            expect(movements.body).toEqual([expect.objectContaining({ type: 'ENTRY', quantity: 10, saleId: null })]);
        });

        it('returns 409 for a duplicated sku', async () => {
            await createProduct();

            const response = await api(app).post('/products').set(bearer(management)).send(validProduct).expect(409);
            expect(response.body.error).toBe('SkuAlreadyExistsError');
        });

        it('returns 400 for a sku outside the TS-<number> format', async () => {
            const response = await api(app)
                .post('/products')
                .set(bearer(management))
                .send({ ...validProduct, sku: 'ABC-1' })
                .expect(400);
            expect(response.body.error).toBe('InvalidProductError');
        });

        it('returns 400 with every validation message for a malformed body', async () => {
            const response = await api(app)
                .post('/products')
                .set(bearer(management))
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
            await api(app).get(`/products/${NIL_UUID}`).set(bearer(management)).expect(404);
            await api(app).get('/products/abc').set(bearer(management)).expect(400);
        });

        it('PATCH /products/:id updates name, description and price only', async () => {
            const product = await createProduct();

            const response = await api(app)
                .patch(`/products/${product.id}`)
                .set(bearer(management))
                .send({ name: 'Caneta Preta', price: 3 })
                .expect(200);
            expect(response.body).toMatchObject({ name: 'Caneta Preta', price: 3, quantity: 10 });

            await api(app).patch(`/products/${product.id}`).set(bearer(management)).send({ quantity: 99 }).expect(400);
        });

        it('POST /products/:id/entries adds stock and records the movement', async () => {
            const product = await createProduct();

            const response = await api(app)
                .post(`/products/${product.id}/entries`)
                .set(bearer(management))
                .send({ quantity: 5 })
                .expect(200);
            expect(response.body.quantity).toBe(15);
        });

        it('DELETE /products/:id deactivates the product and blocks further entries', async () => {
            const product = await createProduct();

            const response = await api(app).delete(`/products/${product.id}`).set(bearer(management)).expect(200);
            expect(response.body.active).toBe(false);

            await api(app)
                .post(`/products/${product.id}/entries`)
                .set(bearer(management))
                .send({ quantity: 1 })
                .expect(422);
        });
    });

    describe('sales', () => {
        it('a seller sells, the sale records who sold, and only management can cancel', async () => {
            const product = await createProduct({ quantity: 10 });

            const sale = await api(app)
                .post('/sales')
                .set(bearer(seller))
                .send({ items: [{ productId: product.id, quantity: 4 }] })
                .expect(201);
            expect(sale.body).toMatchObject({ status: 'COMPLETED', total: 10, userId: seller.user.id });
            expect(sale.body.items[0]).toMatchObject({
                productId: product.id,
                quantity: 4,
                unitPrice: 2.5,
                subtotal: 10,
            });

            const afterSale = await api(app).get(`/products/${product.id}`).set(bearer(seller)).expect(200);
            expect(afterSale.body.quantity).toBe(6);

            await api(app).post(`/sales/${sale.body.id}/cancel`).set(bearer(seller)).expect(403);

            const cancelled = await api(app).post(`/sales/${sale.body.id}/cancel`).set(bearer(management)).expect(200);
            expect(cancelled.body.status).toBe('CANCELLED');
            expect(cancelled.body.cancelledAt).not.toBeNull();

            const afterCancel = await api(app).get(`/products/${product.id}`).set(bearer(seller)).expect(200);
            expect(afterCancel.body.quantity).toBe(10);

            await api(app).post(`/sales/${sale.body.id}/cancel`).set(bearer(management)).expect(422);

            const movements = await api(app).get(`/products/${product.id}/movements`).set(bearer(seller)).expect(200);
            expect(movements.body.map((m: { type: string }) => m.type)).toEqual(['SALE_CANCELLATION', 'SALE', 'ENTRY']);
        });

        it('returns 422 when the stock is insufficient and writes nothing', async () => {
            const product = await createProduct({ quantity: 3 });

            const response = await api(app)
                .post('/sales')
                .set(bearer(seller))
                .send({ items: [{ productId: product.id, quantity: 4 }] })
                .expect(422);
            expect(response.body.error).toBe('InsufficientStockError');

            const sales = await api(app).get('/sales').set(bearer(seller)).expect(200);
            expect(sales.body).toHaveLength(0);
        });

        it('validates the cart body', async () => {
            await api(app).post('/sales').set(bearer(seller)).send({ items: [] }).expect(400);
            await api(app)
                .post('/sales')
                .set(bearer(seller))
                .send({ items: [{ productId: 'nope', quantity: 0 }] })
                .expect(400);
            // userId vem do token: enviar no body é recusado.
            await api(app)
                .post('/sales')
                .set(bearer(seller))
                .send({ userId: NIL_UUID, items: [{ productId: NIL_UUID, quantity: 1 }] })
                .expect(400);
        });

        it('GET /sales/:id returns 404 for an unknown sale', async () => {
            await api(app).get(`/sales/${NIL_UUID}`).set(bearer(seller)).expect(404);
        });

        it('never oversells under concurrent sales of the same product', async () => {
            const product = await createProduct({ quantity: 10 });

            const responses = await Promise.all(
                Array.from({ length: 20 }, () =>
                    api(app)
                        .post('/sales')
                        .set(bearer(seller))
                        .send({ items: [{ productId: product.id, quantity: 1 }] }),
                ),
            );

            // Garantia do sistema: nunca vender além do saldo. Sob disputa extrema, algumas
            // requisições podem esgotar as tentativas do lock otimista e receber 409 (cliente
            // tenta de novo); por isso o número exato de 201 não é determinístico.
            const statuses = responses.map((r) => r.status);
            const sold = statuses.filter((s) => s === 201).length;
            expect(statuses.every((s) => [201, 409, 422].includes(s))).toBe(true);
            expect(sold).toBeGreaterThan(0);
            expect(sold).toBeLessThanOrEqual(10);

            const after = await api(app).get(`/products/${product.id}`).set(bearer(seller)).expect(200);
            expect(after.body.quantity).toBe(10 - sold);

            const movements = await api(app).get(`/products/${product.id}/movements`).set(bearer(seller)).expect(200);
            expect(movements.body.filter((m: { type: string }) => m.type === 'SALE')).toHaveLength(sold);

            const sales = await api(app).get('/sales').set(bearer(seller)).expect(200);
            expect(sales.body).toHaveLength(sold);
        });
    });
});
