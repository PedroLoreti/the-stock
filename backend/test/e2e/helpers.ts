import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { setupApp } from '../../src/app-setup.js';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service.js';
import { BootstrapAdminUseCase } from '../../src/user/application/use-cases/bootstrap-admin.use-case.js';
import { UserRole } from '../../src/user/domain/entities/user.entity.js';

export const ADMIN_INITIAL_PASSWORD = 'admin123';
export const ADMIN_PASSWORD = 'Admin#changed1';
export const TEMP_PASSWORD = 'Temp#12345';
export const USER_PASSWORD = 'User#changed1';
export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export interface SessionUser {
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    mustChangePassword: boolean;
}

export interface Session {
    accessToken: string;
    /** Valor do cookie `refresh_token=...`, pronto para o header Cookie. */
    refreshCookie: string;
    user: SessionUser;
}

export async function createTestApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = setupApp(moduleRef.createNestApplication());
    await app.listen(0); // porta aleatória: o supertest reaproveita o servidor entre as requisições
    return app;
}

export function api(app: INestApplication) {
    return request(app.getHttpServer());
}

export function bearer(session: Session): Record<string, string> {
    return { Authorization: `Bearer ${session.accessToken}` };
}

export async function truncateAll(app: INestApplication): Promise<void> {
    await app
        .get(PrismaService)
        .db.$executeRawUnsafe(
            'TRUNCATE TABLE "stock_movements", "sale_items", "sales", "refresh_tokens", "products", "users" RESTART IDENTITY CASCADE',
        );
}

export async function truncateStock(app: INestApplication): Promise<void> {
    await app
        .get(PrismaService)
        .db.$executeRawUnsafe(
            'TRUNCATE TABLE "stock_movements", "sale_items", "sales", "products" RESTART IDENTITY CASCADE',
        );
}

/** A linha completa do Set-Cookie do refresh (com HttpOnly, Path, SameSite...). */
export function rawRefreshCookieOf(response: request.Response): string {
    const header = response.headers['set-cookie'] as unknown as string[] | string | undefined;
    const cookies = Array.isArray(header) ? header : header ? [header] : [];
    const cookie = cookies.find((value) => value.startsWith('refresh_token='));
    if (!cookie) {
        throw new Error('refresh_token cookie not set');
    }
    return cookie;
}

/** Só `refresh_token=<valor>`, pronto para o header Cookie. */
export function refreshCookieOf(response: request.Response): string {
    return rawRefreshCookieOf(response).split(';')[0];
}

function toSession(response: request.Response): Session {
    return {
        accessToken: response.body.accessToken,
        refreshCookie: refreshCookieOf(response),
        user: response.body.user,
    };
}

export async function login(app: INestApplication, loginValue: string, password: string): Promise<Session> {
    const response = await api(app).post('/auth/login').send({ login: loginValue, password }).expect(200);
    return toSession(response);
}

export async function changePassword(
    app: INestApplication,
    session: Session,
    currentPassword: string,
    newPassword: string,
): Promise<Session> {
    const response = await api(app)
        .patch('/auth/password')
        .set(bearer(session))
        .send({ currentPassword, newPassword })
        .expect(200);
    return toSession(response);
}

/** Recria o admin inicial (como no primeiro boot) e já conclui a troca obrigatória de senha. */
export async function seedAdmin(app: INestApplication): Promise<Session> {
    await app.get(BootstrapAdminUseCase).execute({
        username: 'admin',
        email: 'admin@thestock.local',
        password: ADMIN_INITIAL_PASSWORD,
    });
    const initial = await login(app, 'admin', ADMIN_INITIAL_PASSWORD);
    return changePassword(app, initial, ADMIN_INITIAL_PASSWORD, ADMIN_PASSWORD);
}

let userCounter = 0;

/** Admin cria o usuário com senha temporária; o usuário loga e conclui a troca obrigatória. */
export async function createUserSession(app: INestApplication, admin: Session, role: UserRole): Promise<Session> {
    userCounter++;
    const username = `${role.toLowerCase()}${userCounter}`;
    await api(app)
        .post('/users')
        .set(bearer(admin))
        .send({
            name: `${role} ${userCounter}`,
            username,
            email: `${username}@thestock.local`,
            password: TEMP_PASSWORD,
            role,
        })
        .expect(201);
    const initial = await login(app, username, TEMP_PASSWORD);
    return changePassword(app, initial, TEMP_PASSWORD, USER_PASSWORD);
}
