import { User, UserProps } from '../../src/user/domain/entities/user.entity.js';
import { UserRepository } from '../../src/user/domain/repositories/user.repository.js';
import { Snapshotable } from './snapshotable.js';

function toProps(user: User): UserProps {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        active: user.active,
        mustChangePassword: user.mustChangePassword,
    };
}

export class InMemoryUserRepository implements UserRepository, Snapshotable {
    private rows = new Map<string, UserProps>();

    async save(user: User): Promise<void> {
        this.rows.set(user.id, toProps(user));
    }

    async findById(id: string): Promise<User | null> {
        const row = this.rows.get(id);
        return row ? User.restore({ ...row }) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const row = [...this.rows.values()].find((item) => item.username === username);
        return row ? User.restore({ ...row }) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const row = [...this.rows.values()].find((item) => item.email === email);
        return row ? User.restore({ ...row }) : null;
    }

    async findAll(options: { includeInactive?: boolean } = {}): Promise<User[]> {
        return [...this.rows.values()]
            .filter((row) => options.includeInactive || row.active)
            .map((row) => User.restore({ ...row }));
    }

    async count(): Promise<number> {
        return this.rows.size;
    }

    snapshot(): unknown {
        return new Map([...this.rows].map(([id, row]) => [id, { ...row }]));
    }

    restore(snapshot: unknown): void {
        this.rows = snapshot as Map<string, UserProps>;
    }
}
