import { Page, PageRequest } from '../../../shared/application/pagination.js';
import { User } from '../entities/user.entity.js';

export interface FindAllUsersOptions extends PageRequest {
    /** Por padrão só os ativos são listados. */
    includeInactive?: boolean;
    /** Trecho do nome, username ou email, sem distinguir maiúsculas. */
    search?: string;
}

export abstract class UserRepository {
    abstract save(user: User): Promise<void>;
    abstract findById(id: string): Promise<User | null>;
    abstract findByUsername(username: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findAll(options: FindAllUsersOptions): Promise<Page<User>>;
    abstract count(): Promise<number>;
}
