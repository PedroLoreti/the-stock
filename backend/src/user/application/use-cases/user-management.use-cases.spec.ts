import { FakePasswordHasher } from '../../../../test/fakes/fake-password-hasher.js';
import { InMemoryUserRepository } from '../../../../test/fakes/in-memory-user.repository.js';
import { makeUser } from '../../../../test/factories/user.factory.js';
import { UserRole } from '../../domain/entities/user.entity.js';
import { CannotDeactivateSelfError } from '../../domain/errors/cannot-deactivate-self.error.js';
import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists.error.js';
import { InvalidPasswordError } from '../../domain/errors/invalid-password.error.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import { UsernameAlreadyExistsError } from '../../domain/errors/username-already-exists.error.js';
import { BootstrapAdminUseCase } from './bootstrap-admin.use-case.js';
import { CreateUserUseCase } from './create-user.use-case.js';
import { DeactivateUserUseCase } from './deactivate-user.use-case.js';
import { GetUserUseCase } from './get-user.use-case.js';
import { ListUsersUseCase } from './list-users.use-case.js';
import { ResetPasswordUseCase } from './reset-password.use-case.js';
import { RestoreUserUseCase } from './restore-user.use-case.js';
import { UpdateUserUseCase } from './update-user.use-case.js';

describe('User management use cases', () => {
    let users: InMemoryUserRepository;
    const hasher = new FakePasswordHasher();

    beforeEach(() => {
        users = new InMemoryUserRepository();
    });

    describe('BootstrapAdminUseCase', () => {
        const input = { username: 'admin', email: 'admin@thestock.local', password: 'admin123' };

        it('creates the initial admin, forced to change the password, when there are no users', async () => {
            const admin = await new BootstrapAdminUseCase(users, hasher).execute(input);

            expect(admin).not.toBeNull();
            expect(admin!.role).toBe(UserRole.ADMIN);
            expect(admin!.mustChangePassword).toBe(true);
            expect(admin!.passwordHash).toBe('hashed:admin123');
            expect(await users.count()).toBe(1);
        });

        it('does nothing when a user already exists (idempotent)', async () => {
            await users.save(makeUser());

            const result = await new BootstrapAdminUseCase(users, hasher).execute(input);

            expect(result).toBeNull();
            expect(await users.count()).toBe(1);
        });
    });

    describe('CreateUserUseCase', () => {
        const input = {
            name: 'Ana',
            username: 'Ana',
            email: 'ANA@thestock.local',
            password: 'temporary1',
            role: UserRole.SELLER,
        };

        it('creates the user with a hashed temporary password and mustChangePassword', async () => {
            const user = await new CreateUserUseCase(users, hasher).execute(input);

            expect(user.username).toBe('ana');
            expect(user.email).toBe('ana@thestock.local');
            expect(user.passwordHash).toBe('hashed:temporary1');
            expect(user.mustChangePassword).toBe(true);
            expect(await users.findById(user.id)).not.toBeNull();
        });

        it('rejects a username already in use, ignoring case', async () => {
            await users.save(makeUser({ username: 'ana' }));

            await expect(new CreateUserUseCase(users, hasher).execute(input)).rejects.toBeInstanceOf(
                UsernameAlreadyExistsError,
            );
        });

        it('rejects an email already in use, ignoring case', async () => {
            await users.save(makeUser({ email: 'ana@thestock.local' }));

            await expect(new CreateUserUseCase(users, hasher).execute(input)).rejects.toBeInstanceOf(
                EmailAlreadyExistsError,
            );
        });

        it('rejects a weak password without persisting', async () => {
            await expect(
                new CreateUserUseCase(users, hasher).execute({ ...input, password: 'short' }),
            ).rejects.toBeInstanceOf(InvalidPasswordError);
            expect(await users.count()).toBe(0);
        });
    });

    describe('GetUserUseCase / ListUsersUseCase', () => {
        it('gets a user or throws', async () => {
            const user = makeUser();
            await users.save(user);

            expect((await new GetUserUseCase(users).execute({ id: user.id })).id).toBe(user.id);
            await expect(new GetUserUseCase(users).execute({ id: 'missing' })).rejects.toBeInstanceOf(
                UserNotFoundError,
            );
        });

        it('lists only active users unless includeInactive is set', async () => {
            const inactive = makeUser();
            inactive.deactivate();
            await users.save(makeUser());
            await users.save(inactive);

            expect((await new ListUsersUseCase(users).execute()).items).toHaveLength(1);
            expect((await new ListUsersUseCase(users).execute({ includeInactive: true })).items).toHaveLength(2);
        });

        it('searches by name, username or email and paginates', async () => {
            await users.save(makeUser({ name: 'Ana Souza', username: 'ana', email: 'ana@thestock.local' }));
            await users.save(makeUser({ name: 'Bruno Lima', username: 'bruno', email: 'bruno@thestock.local' }));

            expect((await new ListUsersUseCase(users).execute({ search: 'souza' })).items).toHaveLength(1);
            expect((await new ListUsersUseCase(users).execute({ search: 'bruno@' })).items).toHaveLength(1);
            const page = await new ListUsersUseCase(users).execute({ page: 2, pageSize: 1 });
            expect(page.items.map((u) => u.name)).toEqual(['Bruno Lima']);
            expect(page.total).toBe(2);
        });
    });

    describe('UpdateUserUseCase', () => {
        it('updates name, email and role', async () => {
            const user = makeUser({ role: UserRole.SELLER });
            await users.save(user);

            const result = await new UpdateUserUseCase(users).execute({
                id: user.id,
                name: 'Novo',
                email: 'novo@x.com',
                role: UserRole.MANAGEMENT,
            });

            expect(result).toMatchObject({ name: 'Novo', email: 'novo@x.com', role: UserRole.MANAGEMENT });
            expect((await users.findById(user.id))!.role).toBe(UserRole.MANAGEMENT);
        });

        it('rejects an email that belongs to another user, but accepts the user own email', async () => {
            const user = makeUser({ email: 'me@x.com' });
            const other = makeUser({ email: 'other@x.com' });
            await users.save(user);
            await users.save(other);

            await expect(
                new UpdateUserUseCase(users).execute({ id: user.id, email: 'other@x.com' }),
            ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
            await expect(
                new UpdateUserUseCase(users).execute({ id: user.id, email: 'ME@x.com' }),
            ).resolves.toBeDefined();
        });
    });

    describe('DeactivateUserUseCase / RestoreUserUseCase', () => {
        it('deactivates another user and restores it', async () => {
            const admin = makeUser({ role: UserRole.ADMIN });
            const user = makeUser();
            await users.save(admin);
            await users.save(user);

            await new DeactivateUserUseCase(users).execute({ id: user.id, actorId: admin.id });
            expect((await users.findById(user.id))!.active).toBe(false);

            await new RestoreUserUseCase(users).execute({ id: user.id });
            expect((await users.findById(user.id))!.active).toBe(true);
        });

        it('refuses to deactivate yourself', async () => {
            const admin = makeUser({ role: UserRole.ADMIN });
            await users.save(admin);

            await expect(
                new DeactivateUserUseCase(users).execute({ id: admin.id, actorId: admin.id }),
            ).rejects.toBeInstanceOf(CannotDeactivateSelfError);
        });
    });

    describe('ResetPasswordUseCase', () => {
        it('sets a temporary password and forces a change', async () => {
            const user = makeUser({ mustChangePassword: false });
            await users.save(user);

            await new ResetPasswordUseCase(users, hasher).execute({ id: user.id, temporaryPassword: 'temporary1' });

            const saved = (await users.findById(user.id))!;
            expect(saved.passwordHash).toBe('hashed:temporary1');
            expect(saved.mustChangePassword).toBe(true);
        });

        it('rejects a weak temporary password', async () => {
            const user = makeUser();
            await users.save(user);

            await expect(
                new ResetPasswordUseCase(users, hasher).execute({ id: user.id, temporaryPassword: 'abc' }),
            ).rejects.toBeInstanceOf(InvalidPasswordError);
        });
    });
});
