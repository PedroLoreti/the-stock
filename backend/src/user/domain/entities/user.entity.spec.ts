import { makeUser } from '../../../../test/factories/user.factory.js';
import { InvalidUserError } from '../errors/invalid-user.error.js';
import { User, UserRole } from './user.entity.js';

describe('User', () => {
    describe('create', () => {
        it('creates an active user that must change the password by default', () => {
            const user = User.create({
                name: 'Ana',
                username: 'ana',
                email: 'ana@thestock.local',
                passwordHash: 'hash',
                role: UserRole.SELLER,
            });

            expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(user.active).toBe(true);
            expect(user.mustChangePassword).toBe(true);
        });

        it('normalizes username and email to lowercase and trims the name', () => {
            const user = makeUser({ name: '  Ana  ', username: '  Ana.Silva ', email: ' ANA@Example.COM ' });

            expect(user.name).toBe('Ana');
            expect(user.username).toBe('ana.silva');
            expect(user.email).toBe('ana@example.com');
        });

        it.each(['', ' '])('rejects an empty name (%j)', (name) => {
            expect(() => makeUser({ name })).toThrow(InvalidUserError);
        });

        it.each(['ab', 'a'.repeat(31), 'ana silva', 'ana@x', 'ana-silva'])('rejects username %j', (username) => {
            expect(() => makeUser({ username })).toThrow(InvalidUserError);
        });

        it.each(['ana', 'ana@', '@x.com', 'ana@x', 'a a@x.com'])('rejects email %j', (email) => {
            expect(() => makeUser({ email })).toThrow(InvalidUserError);
        });

        it('rejects an unknown role', () => {
            expect(() => makeUser({ role: 'ROOT' as UserRole })).toThrow(InvalidUserError);
        });
    });

    describe('isEmail', () => {
        it('tells emails apart from usernames', () => {
            expect(User.isEmail('ana@x.com')).toBe(true);
            expect(User.isEmail('ana')).toBe(false);
        });
    });

    describe('update / changeRole', () => {
        it('updates only the provided fields', () => {
            const user = makeUser({ name: 'Ana', email: 'ana@x.com' });

            user.update({ email: 'NEW@x.com' });

            expect(user.name).toBe('Ana');
            expect(user.email).toBe('new@x.com');
        });

        it('rejects an invalid email and keeps the previous one', () => {
            const user = makeUser({ email: 'ana@x.com' });
            expect(() => user.update({ email: 'nope' })).toThrow(InvalidUserError);
            expect(user.email).toBe('ana@x.com');
        });

        it('changes the role', () => {
            const user = makeUser({ role: UserRole.SELLER });
            user.changeRole(UserRole.MANAGEMENT);
            expect(user.role).toBe(UserRole.MANAGEMENT);
        });
    });

    describe('passwords', () => {
        it('changePassword stores the hash and clears mustChangePassword', () => {
            const user = makeUser({ mustChangePassword: true });

            user.changePassword('hashed:new');

            expect(user.passwordHash).toBe('hashed:new');
            expect(user.mustChangePassword).toBe(false);
        });

        it('resetPassword stores the hash and forces a change on next login', () => {
            const user = makeUser({ mustChangePassword: false });

            user.resetPassword('hashed:temp');

            expect(user.passwordHash).toBe('hashed:temp');
            expect(user.mustChangePassword).toBe(true);
        });
    });

    describe('deactivate / activate', () => {
        it('toggles the active flag', () => {
            const user = makeUser();
            user.deactivate();
            expect(user.active).toBe(false);
            user.activate();
            expect(user.active).toBe(true);
        });
    });
});
