import { User } from '../entities/user.entity.js';

export abstract class UserRepository {
    abstract save(user: User): Promise<void>;
    abstract findById(id: string): Promise<User | null>;
    abstract findByUsername(username: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findAll(options?: { includeInactive?: boolean }): Promise<User[]>;
    abstract count(): Promise<number>;
}
