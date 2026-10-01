import { FakeAuthConfig } from '../../../../test/fakes/fake-auth-config.js';
import { FakePasswordHasher } from '../../../../test/fakes/fake-password-hasher.js';
import { FakeTokenService } from '../../../../test/fakes/fake-token-service.js';
import { InMemoryRefreshTokenRepository } from '../../../../test/fakes/in-memory-refresh-token.repository.js';
import { InMemoryUnitOfWork } from '../../../../test/fakes/in-memory-unit-of-work.js';
import { InMemoryUserRepository } from '../../../../test/fakes/in-memory-user.repository.js';
import { makeUser } from '../../../../test/factories/user.factory.js';
import { InvalidPasswordError } from '../../../user/domain/errors/invalid-password.error.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { InvalidRefreshTokenError } from '../../domain/errors/invalid-refresh-token.error.js';
import { WrongCurrentPasswordError } from '../../domain/errors/wrong-current-password.error.js';
import { hashRefreshTokenSecret } from '../../domain/refresh-token-secret.js';
import { TokenIssuer } from '../services/token-issuer.js';
import { ChangePasswordUseCase } from './change-password.use-case.js';
import { LoginUseCase } from './login.use-case.js';
import { LogoutUseCase } from './logout.use-case.js';
import { RefreshTokensUseCase } from './refresh-tokens.use-case.js';

const DAY = 24 * 60 * 60 * 1000;

describe('Auth use cases', () => {
    let users: InMemoryUserRepository;
    let refreshTokens: InMemoryRefreshTokenRepository;
    let tokenService: FakeTokenService;
    let issuer: TokenIssuer;
    let login: LoginUseCase;
    let refresh: RefreshTokensUseCase;
    let changePassword: ChangePasswordUseCase;
    const hasher = new FakePasswordHasher();

    beforeEach(() => {
        users = new InMemoryUserRepository();
        refreshTokens = new InMemoryRefreshTokenRepository();
        tokenService = new FakeTokenService();
        issuer = new TokenIssuer(tokenService, refreshTokens, new FakeAuthConfig(7 * DAY));
        const unitOfWork = new InMemoryUnitOfWork(users, refreshTokens);
        login = new LoginUseCase(users, hasher, issuer);
        refresh = new RefreshTokensUseCase(refreshTokens, users, issuer, unitOfWork);
        changePassword = new ChangePasswordUseCase(users, refreshTokens, hasher, issuer, unitOfWork);
    });

    describe('LoginUseCase', () => {
        it('logs in by username and issues an access token with the user claims', async () => {
            const user = makeUser({ username: 'ana', mustChangePassword: true });
            await users.save(user);

            const result = await login.execute({ login: 'ANA', password: 'correct-password' });

            expect(result.user.id).toBe(user.id);
            await expect(tokenService.verifyAccessToken(result.accessToken)).resolves.toEqual({
                sub: user.id,
                role: user.role,
                mustChangePassword: true,
            });
            expect(refreshTokens.activeCountFor(user.id)).toBe(1);
        });

        it('logs in by email', async () => {
            const user = makeUser({ email: 'ana@x.com' });
            await users.save(user);

            const result = await login.execute({ login: 'Ana@X.com', password: 'correct-password' });

            expect(result.user.id).toBe(user.id);
        });

        it('stores only the hash of the refresh token', async () => {
            await users.save(makeUser({ username: 'ana' }));

            const { refreshToken } = await login.execute({ login: 'ana', password: 'correct-password' });

            expect(await refreshTokens.findByTokenHash(refreshToken)).toBeNull();
            expect(await refreshTokens.findByTokenHash(hashRefreshTokenSecret(refreshToken))).not.toBeNull();
        });

        it.each([
            ['unknown login', 'nobody', 'correct-password'],
            ['wrong password', 'ana', 'wrong-password'],
        ])('rejects %s with the same generic error', async (_label, loginValue, password) => {
            await users.save(makeUser({ username: 'ana' }));

            await expect(login.execute({ login: loginValue, password })).rejects.toBeInstanceOf(
                InvalidCredentialsError,
            );
        });

        it('rejects an inactive user even with the right password', async () => {
            const user = makeUser({ username: 'ana' });
            user.deactivate();
            await users.save(user);

            await expect(login.execute({ login: 'ana', password: 'correct-password' })).rejects.toBeInstanceOf(
                InvalidCredentialsError,
            );
        });
    });

    describe('RefreshTokensUseCase', () => {
        it('rotates: issues a new pair and revokes the presented token', async () => {
            const user = makeUser({ username: 'ana' });
            await users.save(user);
            const first = await login.execute({ login: 'ana', password: 'correct-password' });

            const second = await refresh.execute({ refreshToken: first.refreshToken });

            expect(second.refreshToken).not.toBe(first.refreshToken);
            expect(refreshTokens.activeCountFor(user.id)).toBe(1);
            await expect(refresh.execute({ refreshToken: first.refreshToken })).rejects.toBeInstanceOf(
                InvalidRefreshTokenError,
            );
        });

        it('treats reuse of a rotated token as theft and revokes every session of the user', async () => {
            const user = makeUser({ username: 'ana' });
            await users.save(user);
            const first = await login.execute({ login: 'ana', password: 'correct-password' });
            const second = await refresh.execute({ refreshToken: first.refreshToken });

            await expect(refresh.execute({ refreshToken: first.refreshToken })).rejects.toBeInstanceOf(
                InvalidRefreshTokenError,
            );

            expect(refreshTokens.activeCountFor(user.id)).toBe(0);
            await expect(refresh.execute({ refreshToken: second.refreshToken })).rejects.toBeInstanceOf(
                InvalidRefreshTokenError,
            );
        });

        it('rejects an unknown token', async () => {
            await expect(refresh.execute({ refreshToken: 'garbage' })).rejects.toBeInstanceOf(InvalidRefreshTokenError);
        });

        it('rejects an expired token', async () => {
            const user = makeUser({ username: 'ana' });
            await users.save(user);
            const shortIssuer = new TokenIssuer(tokenService, refreshTokens, new FakeAuthConfig(-1));
            const { refreshToken } = await shortIssuer.issueFor(user);

            await expect(refresh.execute({ refreshToken })).rejects.toBeInstanceOf(InvalidRefreshTokenError);
        });

        it('rejects a token of a user that was deactivated meanwhile', async () => {
            const user = makeUser({ username: 'ana' });
            await users.save(user);
            const { refreshToken } = await login.execute({ login: 'ana', password: 'correct-password' });
            user.deactivate();
            await users.save(user);

            await expect(refresh.execute({ refreshToken })).rejects.toBeInstanceOf(InvalidRefreshTokenError);
            expect(refreshTokens.activeCountFor(user.id)).toBe(0);
        });
    });

    describe('LogoutUseCase', () => {
        it('revokes the token and is idempotent', async () => {
            const user = makeUser({ username: 'ana' });
            await users.save(user);
            const { refreshToken } = await login.execute({ login: 'ana', password: 'correct-password' });
            const logout = new LogoutUseCase(refreshTokens);

            await logout.execute({ refreshToken });
            await expect(logout.execute({ refreshToken })).resolves.toBeUndefined();
            await expect(logout.execute({ refreshToken: 'garbage' })).resolves.toBeUndefined();

            expect(refreshTokens.activeCountFor(user.id)).toBe(0);
            await expect(refresh.execute({ refreshToken })).rejects.toBeInstanceOf(InvalidRefreshTokenError);
        });
    });

    describe('ChangePasswordUseCase', () => {
        it('changes the password, clears the flag, ends other sessions and issues new tokens', async () => {
            const user = makeUser({ username: 'ana', mustChangePassword: true });
            await users.save(user);
            const session = await login.execute({ login: 'ana', password: 'correct-password' });

            const result = await changePassword.execute({
                userId: user.id,
                currentPassword: 'correct-password',
                newPassword: 'brand-new-password',
            });

            const saved = (await users.findById(user.id))!;
            expect(saved.passwordHash).toBe('hashed:brand-new-password');
            expect(saved.mustChangePassword).toBe(false);
            await expect(tokenService.verifyAccessToken(result.accessToken)).resolves.toMatchObject({
                mustChangePassword: false,
            });
            expect(refreshTokens.activeCountFor(user.id)).toBe(1);
            await expect(refresh.execute({ refreshToken: session.refreshToken })).rejects.toBeInstanceOf(
                InvalidRefreshTokenError,
            );
            await expect(login.execute({ login: 'ana', password: 'brand-new-password' })).resolves.toBeDefined();
            // O refresh antigo apagado nao e tratado como roubo: a sessao nova continua valida.
            await expect(refresh.execute({ refreshToken: result.refreshToken })).resolves.toBeDefined();
        });

        it('rejects a wrong current password', async () => {
            const user = makeUser();
            await users.save(user);

            await expect(
                changePassword.execute({ userId: user.id, currentPassword: 'nope', newPassword: 'brand-new-password' }),
            ).rejects.toBeInstanceOf(WrongCurrentPasswordError);
        });

        it.each([
            ['too short', 'short'],
            ['same as current', 'correct-password'],
        ])('rejects a new password that is %s, without saving', async (_label, newPassword) => {
            const user = makeUser();
            await users.save(user);

            await expect(
                changePassword.execute({ userId: user.id, currentPassword: 'correct-password', newPassword }),
            ).rejects.toBeInstanceOf(InvalidPasswordError);
            expect((await users.findById(user.id))!.passwordHash).toBe('hashed:correct-password');
        });
    });
});
