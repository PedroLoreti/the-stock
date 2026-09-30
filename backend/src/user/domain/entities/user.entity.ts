import { randomUUID } from 'node:crypto';
import { InvalidUserError } from '../errors/invalid-user.error.js';

export const UserRole = {
    ADMIN: 'ADMIN',
    MANAGEMENT: 'MANAGEMENT',
    SELLER: 'SELLER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface UserProps {
    id: string;
    name: string;
    username: string;
    email: string;
    /** Hash bcrypt; a entidade nunca vê a senha em texto puro. */
    passwordHash: string;
    role: UserRole;
    active: boolean;
    /** Força a troca de senha no próximo login (admin inicial, senha temporária de reset). */
    mustChangePassword: boolean;
}

export type CreateUserProps = Omit<UserProps, 'id' | 'active' | 'mustChangePassword'> & {
    mustChangePassword?: boolean;
};
export type UpdateUserProps = Partial<Pick<UserProps, 'name' | 'email'>>;

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
    private constructor(private props: UserProps) {}

    static create(data: CreateUserProps): User {
        const username = User.normalizeUsername(data.username);
        const email = User.normalizeEmail(data.email);
        User.validateName(data.name);
        User.validateUsername(username);
        User.validateEmail(email);
        User.validateRole(data.role);

        return new User({
            id: randomUUID(),
            name: data.name.trim(),
            username,
            email,
            passwordHash: data.passwordHash,
            role: data.role,
            active: true,
            mustChangePassword: data.mustChangePassword ?? true,
        });
    }

    static restore(props: UserProps): User {
        return new User(props);
    }

    static normalizeUsername(username: string): string {
        return (username ?? '').trim().toLowerCase();
    }

    static normalizeEmail(email: string): string {
        return (email ?? '').trim().toLowerCase();
    }

    /** Decide por qual campo procurar quando o login pode ser email ou username. */
    static isEmail(login: string): boolean {
        return login.includes('@');
    }

    update(data: UpdateUserProps): void {
        if (data.name !== undefined) {
            User.validateName(data.name);
            this.props.name = data.name.trim();
        }
        if (data.email !== undefined) {
            const email = User.normalizeEmail(data.email);
            User.validateEmail(email);
            this.props.email = email;
        }
    }

    changeRole(role: UserRole): void {
        User.validateRole(role);
        this.props.role = role;
    }

    /** Senha definida pelo próprio usuário: encerra a obrigação de troca. */
    changePassword(newPasswordHash: string): void {
        this.props.passwordHash = newPasswordHash;
        this.props.mustChangePassword = false;
    }

    /** Senha temporária definida por um admin: o usuário terá de trocá-la no próximo login. */
    resetPassword(temporaryPasswordHash: string): void {
        this.props.passwordHash = temporaryPasswordHash;
        this.props.mustChangePassword = true;
    }

    deactivate(): void {
        this.props.active = false;
    }

    activate(): void {
        this.props.active = true;
    }

    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get username() {
        return this.props.username;
    }
    get email() {
        return this.props.email;
    }
    get passwordHash() {
        return this.props.passwordHash;
    }
    get role() {
        return this.props.role;
    }
    get active() {
        return this.props.active;
    }
    get mustChangePassword() {
        return this.props.mustChangePassword;
    }

    private static validateName(name: string): void {
        if (!name?.trim()) {
            throw new InvalidUserError('Name is required');
        }
    }

    private static validateUsername(username: string): void {
        if (!USERNAME_PATTERN.test(username)) {
            throw new InvalidUserError('Username must have 3-30 characters: letters, numbers, "." or "_"');
        }
    }

    private static validateEmail(email: string): void {
        if (!EMAIL_PATTERN.test(email)) {
            throw new InvalidUserError('Email is invalid');
        }
    }

    private static validateRole(role: UserRole): void {
        if (!Object.values(UserRole).includes(role)) {
            throw new InvalidUserError('Role is invalid');
        }
    }
}
