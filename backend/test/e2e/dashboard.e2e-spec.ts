import { INestApplication } from '@nestjs/common';
import { UserRole } from '../../src/user/domain/entities/user.entity.js';
import {
    api,
    bearer,
    createTestApp,
    createUserSession,
    seedAdmin,
    Session,
    truncateAll,
    truncateStock,
} from './helpers.js';

describe('dashboard (e2e)', () => {
    let app: INestApplication;
    let admin: Session;
    let management: Session;
    let seller: Session;

    async function createProduct(sku: string, price: number, quantity: number, minStock = 0) {
        const response = await api(app)
            .post('/products')
            .set(bearer(management))
            .send({ name: `Product ${sku}`, description: '', sku, price, quantity, minStock })
            .expect(201);
        return response.body as { id: string };
    }

    async function sell(items: Array<{ productId: string; quantity: number }>, as: Session = seller) {
        const response = await api(app).post('/sales').set(bearer(as)).send({ items }).expect(201);
        return response.body as { id: string; total: number };
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

    it('requires authentication', async () => {
        await api(app).get('/dashboard').expect(401);
    });

    it('returns zeroed metrics on an empty database', async () => {
        const response = await api(app).get('/dashboard').set(bearer(admin)).expect(200);

        expect(response.body).toMatchObject({
            today: { revenue: 0, salesCount: 0 },
            last7Days: { revenue: 0, salesCount: 0, averageTicket: 0 },
            stock: { activeProducts: 0, inventoryValue: 0, lowStockCount: 0 },
            lowStockProducts: [],
            recentSales: [],
            topProducts: [],
        });
    });

    it('aggregates sales, stock alerts and top products; cancelled sales do not count', async () => {
        const mouse = await createProduct('TS-1', 10, 20, 5);
        const cable = await createProduct('TS-2', 2.5, 3, 3); // já no limite mínimo
        const monitor = await createProduct('TS-3', 1000, 1); // vai esgotar
        const inactive = await createProduct('TS-4', 99, 0);
        await api(app).delete(`/products/${inactive.id}`).set(bearer(management)).expect(200);

        await sell([
            { productId: mouse.id, quantity: 4 },
            { productId: cable.id, quantity: 1 },
        ]); // 40 + 2.5 = 42.5
        await sell([{ productId: monitor.id, quantity: 1 }]); // 1000
        const cancelled = await sell([{ productId: mouse.id, quantity: 2 }]); // 20, cancelada abaixo
        await api(app).post(`/sales/${cancelled.id}/cancel`).set(bearer(management)).expect(200);

        const response = await api(app).get('/dashboard').set(bearer(management)).expect(200);
        const body = response.body;

        expect(body.today).toEqual({ revenue: 1042.5, salesCount: 2 });
        expect(body.last7Days).toEqual({ revenue: 1042.5, salesCount: 2, averageTicket: 521.25 });

        // Estoque: mouse 16 (venda cancelada devolveu 2), cabo 2, monitor 0; inativo fora.
        expect(body.stock).toEqual({ activeProducts: 3, inventoryValue: 16 * 10 + 2 * 2.5, lowStockCount: 2 });
        expect(body.lowStockProducts.map((p: { sku: string }) => p.sku)).toEqual(['TS-3', 'TS-2']);
        expect(body.lowStockProducts[1]).toMatchObject({ quantity: 2, minStock: 3 });

        expect(body.recentSales).toHaveLength(3);
        expect(body.recentSales[0]).toMatchObject({ id: cancelled.id, status: 'CANCELLED', itemCount: 2 });
        expect(body.recentSales.every((s: { userName: string }) => typeof s.userName === 'string')).toBe(true);

        expect(
            body.topProducts.map((p: { sku: string; quantitySold: number; revenue: number }) => [
                p.sku,
                p.quantitySold,
                p.revenue,
            ]),
        ).toEqual([
            ['TS-1', 4, 40],
            ['TS-2', 1, 2.5],
            ['TS-3', 1, 1000],
        ]);
    });

    it('hides the inventory value from sellers', async () => {
        await createProduct('TS-1', 10, 2);

        const response = await api(app).get('/dashboard').set(bearer(seller)).expect(200);

        expect(response.body.stock).toEqual({ activeProducts: 1, inventoryValue: null, lowStockCount: 0 });
    });
});
