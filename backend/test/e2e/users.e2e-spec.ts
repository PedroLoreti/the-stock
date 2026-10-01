import { INestApplication } from '@nestjs/common';
import { UserRole } from '../../src/user/domain/entities/user.entity.js';
import {
    api,
    bearer,
    changePassword,
    createTestApp,
    createUserSession,
    login,
    NIL_UUID,
    seedAdmin,
    Session,
    TEMP_PASSWORD,
    truncateAll,
    USER_PASSWORD,
} from './helpers.js';

describe('users (e2e)', () => {
    let app: INestApplication;
    let admin: Session;
    let management: Session;
    let seller: Session;

    const newUser = (suffix: string, role: UserRole = UserRole.SELLER) => ({
        name: `New ${suffix}`,
        username: `new.${suffix}`,
        email: `new.${suffix}@thestock.local`,
        password: TEMP_PASSWORD,
        role,
    });

    beforeAll(async () => {
        app = await createTestApp();
        await truncateAll(app);
        admin = await seedAdmin(app);
        management = await createUserSession(app, admin, UserRole.MANAGEMENT);
        seller = await createUserSession(app, admin, UserRole.SELLER);
    });

    afterAll(async () => {
        await app.close();
    });

    it('only administrators can manage users', async () => {
        await api(app).get('/users').set(bearer(management)).expect(403);
        await api(app).get('/users').set(bearer(seller)).expect(403);
        await api(app).post('/users').set(bearer(management)).send(newUser('nope')).expect(403);
    });

    describe('POST /users', () => {
        it('creates a user with a temporary password that must be changed on first login', async () => {
            const response = await api(app).post('/users').set(bearer(admin)).send(newUser('alpha')).expect(201);

            expect(response.body).toMatchObject({
                username: 'new.alpha',
                role: 'SELLER',
                active: true,
                mustChangePassword: true,
            });
            expect(response.body).not.toHaveProperty('passwordHash');

            const first = await login(app, 'new.alpha', TEMP_PASSWORD);
            expect(first.user.mustChangePassword).toBe(true);
            await api(app).get('/products').set(bearer(first)).expect(403);

            const settled = await changePassword(app, first, TEMP_PASSWORD, USER_PASSWORD);
            await api(app).get('/products').set(bearer(settled)).expect(200);
        });

        it('returns 409 for a duplicated username or email', async () => {
            await api(app).post('/users').set(bearer(admin)).send(newUser('dup')).expect(201);

            const sameUsername = await api(app)
                .post('/users')
                .set(bearer(admin))
                .send({ ...newUser('dup'), email: 'other@thestock.local' })
                .expect(409);
            expect(sameUsername.body.error).toBe('UsernameAlreadyExistsError');

            const sameEmail = await api(app)
                .post('/users')
                .set(bearer(admin))
                .send({ ...newUser('dup'), username: 'other.user' })
                .expect(409);
            expect(sameEmail.body.error).toBe('EmailAlreadyExistsError');
        });

        it('validates the body', async () => {
            const response = await api(app)
                .post('/users')
                .set(bearer(admin))
                .send({ ...newUser('bad'), email: 'not-an-email', role: 'ROOT', password: 'short' })
                .expect(400);
            expect(response.body.message).toEqual(
                expect.arrayContaining(['Email is invalid', 'Role must be ADMIN, MANAGEMENT or SELLER']),
            );
        });
    });

    describe('GET /users', () => {
        it('lists active users, and inactive ones only on request', async () => {
            const created = await api(app).post('/users').set(bearer(admin)).send(newUser('listed')).expect(201);
            await api(app).delete(`/users/${created.body.id}`).set(bearer(admin)).expect(200);

            const active = await api(app).get('/users').set(bearer(admin)).expect(200);
            expect(active.body.map((u: { id: string }) => u.id)).not.toContain(created.body.id);

            const all = await api(app).get('/users?includeInactive=true').set(bearer(admin)).expect(200);
            expect(all.body.map((u: { id: string }) => u.id)).toContain(created.body.id);
        });

        it('returns 404 for an unknown id', async () => {
            await api(app).get(`/users/${NIL_UUID}`).set(bearer(admin)).expect(404);
        });
    });

    describe('PATCH /users/:id', () => {
        it('updates name, email and role', async () => {
            const created = await api(app).post('/users').set(bearer(admin)).send(newUser('patch')).expect(201);

            const response = await api(app)
                .patch(`/users/${created.body.id}`)
                .set(bearer(admin))
                .send({ name: 'Renamed', role: 'MANAGEMENT' })
                .expect(200);
            expect(response.body).toMatchObject({ name: 'Renamed', role: 'MANAGEMENT' });
        });
    });

    describe('DELETE /users/:id and restore', () => {
        it('deactivates a user, blocks the login, and restores it', async () => {
            const created = await api(app).post('/users').set(bearer(admin)).send(newUser('deact')).expect(201);

            await api(app).delete(`/users/${created.body.id}`).set(bearer(admin)).expect(200);
            await api(app).post('/auth/login').send({ login: 'new.deact', password: TEMP_PASSWORD }).expect(401);

            await api(app).post(`/users/${created.body.id}/restore`).set(bearer(admin)).expect(200);
            await api(app).post('/auth/login').send({ login: 'new.deact', password: TEMP_PASSWORD }).expect(200);
        });

        it('refuses to deactivate yourself', async () => {
            const response = await api(app).delete(`/users/${admin.user.id}`).set(bearer(admin)).expect(422);
            expect(response.body.error).toBe('CannotDeactivateSelfError');
        });
    });

    describe('POST /users/:id/reset-password', () => {
        it('sets a temporary password and forces a change', async () => {
            const created = await api(app).post('/users').set(bearer(admin)).send(newUser('reset')).expect(201);
            const settled = await changePassword(
                app,
                await login(app, 'new.reset', TEMP_PASSWORD),
                TEMP_PASSWORD,
                USER_PASSWORD,
            );
            await api(app).get('/products').set(bearer(settled)).expect(200);

            await api(app)
                .post(`/users/${created.body.id}/reset-password`)
                .set(bearer(admin))
                .send({ temporaryPassword: 'Another#temp1' })
                .expect(200);

            await api(app).post('/auth/login').send({ login: 'new.reset', password: USER_PASSWORD }).expect(401);
            const again = await login(app, 'new.reset', 'Another#temp1');
            expect(again.user.mustChangePassword).toBe(true);
        });
    });
});
