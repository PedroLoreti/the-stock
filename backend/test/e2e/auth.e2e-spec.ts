import { INestApplication } from '@nestjs/common';
import { BootstrapAdminUseCase } from '../../src/user/application/use-cases/bootstrap-admin.use-case.js';
import {
    ADMIN_INITIAL_PASSWORD,
    ADMIN_PASSWORD,
    api,
    bearer,
    changePassword,
    createTestApp,
    login,
    rawRefreshCookieOf,
    refreshCookieOf,
    truncateAll,
} from './helpers.js';

describe('auth (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    beforeEach(async () => {
        // Cada teste parte do estado do primeiro boot: só o admin inicial, com a senha padrão.
        await truncateAll(app);
        await app.get(BootstrapAdminUseCase).execute({
            username: 'admin',
            email: 'admin@thestock.local',
            password: ADMIN_INITIAL_PASSWORD,
        });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('first access', () => {
        it('logs the admin in with the default credentials and forces a password change', async () => {
            const loginResponse = await api(app)
                .post('/auth/login')
                .send({ login: 'admin', password: ADMIN_INITIAL_PASSWORD })
                .expect(200);

            expect(loginResponse.body).toMatchObject({
                mustChangePassword: true,
                user: { username: 'admin', role: 'ADMIN' },
            });
            expect(loginResponse.body).not.toHaveProperty('refreshToken');
            expect(loginResponse.body.user).not.toHaveProperty('passwordHash');

            const cookie = refreshCookieOf(loginResponse);
            const rawCookie = rawRefreshCookieOf(loginResponse);
            expect(rawCookie).toMatch(/HttpOnly/i);
            expect(rawCookie).toMatch(/Path=\/auth/i);
            expect(rawCookie).toMatch(/SameSite=Strict/i);

            const pending = { Authorization: `Bearer ${loginResponse.body.accessToken}` };

            // Qualquer rota de negócio é bloqueada até a troca...
            const blocked = await api(app).get('/products').set(pending).expect(403);
            expect(blocked.body.error).toBe('PasswordChangeRequiredError');

            // ...mas o próprio perfil e a troca de senha ficam liberados.
            await api(app).get('/auth/me').set(pending).expect(200);

            const changed = await api(app)
                .patch('/auth/password')
                .set(pending)
                .send({ currentPassword: ADMIN_INITIAL_PASSWORD, newPassword: ADMIN_PASSWORD })
                .expect(200);
            expect(changed.body.mustChangePassword).toBe(false);
            expect(refreshCookieOf(changed)).not.toBe(cookie);

            await api(app)
                .get('/products')
                .set({ Authorization: `Bearer ${changed.body.accessToken}` })
                .expect(200);

            await api(app).post('/auth/login').send({ login: 'admin', password: ADMIN_INITIAL_PASSWORD }).expect(401);
            await api(app).post('/auth/login').send({ login: 'admin', password: ADMIN_PASSWORD }).expect(200);
        });

        it('rejects a weak new password and a wrong current password', async () => {
            const session = await login(app, 'admin', ADMIN_INITIAL_PASSWORD);

            await api(app)
                .patch('/auth/password')
                .set(bearer(session))
                .send({ currentPassword: ADMIN_INITIAL_PASSWORD, newPassword: 'short' })
                .expect(400);
            await api(app)
                .patch('/auth/password')
                .set(bearer(session))
                .send({ currentPassword: 'wrong', newPassword: ADMIN_PASSWORD })
                .expect(400);
        });
    });

    describe('login', () => {
        it('accepts the email as login, ignoring case', async () => {
            const session = await login(app, 'ADMIN@thestock.local', ADMIN_INITIAL_PASSWORD);
            expect(session.user.username).toBe('admin');
        });

        it.each([
            ['wrong password', 'admin', 'nope-nope-nope'],
            ['unknown user', 'ghost', ADMIN_INITIAL_PASSWORD],
        ])('returns the same generic 401 for %s', async (_label, loginValue, password) => {
            const response = await api(app).post('/auth/login').send({ login: loginValue, password }).expect(401);
            expect(response.body).toEqual({
                statusCode: 401,
                error: 'InvalidCredentialsError',
                message: 'Invalid credentials',
            });
        });

        it('validates the body', async () => {
            await api(app).post('/auth/login').send({ login: 'admin' }).expect(400);
        });
    });

    describe('protected routes', () => {
        it('requires a valid bearer token', async () => {
            await api(app).get('/products').expect(401);
            await api(app).get('/products').set({ Authorization: 'Bearer not-a-jwt' }).expect(401);
            await api(app).get('/products').set({ Authorization: 'Basic abc' }).expect(401);
        });
    });

    describe('refresh', () => {
        it('rotates the refresh token and treats reuse of an old one as theft', async () => {
            const first = await login(app, 'admin', ADMIN_INITIAL_PASSWORD);

            const refreshed = await api(app).post('/auth/refresh').set('Cookie', first.refreshCookie).expect(200);
            const second = refreshCookieOf(refreshed);
            expect(second).not.toBe(first.refreshCookie);
            expect(refreshed.body.accessToken).toBeTruthy();

            // Reuso do token já rotacionado: todas as sessões caem, inclusive a nova.
            await api(app).post('/auth/refresh').set('Cookie', first.refreshCookie).expect(401);
            await api(app).post('/auth/refresh').set('Cookie', second).expect(401);
        });

        it('rejects a missing or unknown cookie', async () => {
            await api(app).post('/auth/refresh').expect(401);
            await api(app).post('/auth/refresh').set('Cookie', 'refresh_token=garbage').expect(401);
        });
    });

    describe('logout', () => {
        it('revokes the refresh token and clears the cookie', async () => {
            const session = await login(app, 'admin', ADMIN_INITIAL_PASSWORD);

            const response = await api(app).post('/auth/logout').set('Cookie', session.refreshCookie).expect(204);
            const cleared = rawRefreshCookieOf(response);
            expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970/);

            await api(app).post('/auth/refresh').set('Cookie', session.refreshCookie).expect(401);
            // Idempotente.
            await api(app).post('/auth/logout').set('Cookie', session.refreshCookie).expect(204);
            await api(app).post('/auth/logout').expect(204);
        });
    });

    describe('password change', () => {
        it('ends the other sessions of the user', async () => {
            const sessionA = await login(app, 'admin', ADMIN_INITIAL_PASSWORD);
            const sessionB = await login(app, 'admin', ADMIN_INITIAL_PASSWORD);

            const changed = await changePassword(app, sessionA, ADMIN_INITIAL_PASSWORD, ADMIN_PASSWORD);

            await api(app).post('/auth/refresh').set('Cookie', sessionB.refreshCookie).expect(401);
            await api(app).post('/auth/refresh').set('Cookie', changed.refreshCookie).expect(200);
        });
    });
});
