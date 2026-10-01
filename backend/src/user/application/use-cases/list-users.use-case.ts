import { Injectable } from '@nestjs/common';
import { Page, PageRequest, pageRequest } from '../../../shared/application/pagination.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export interface ListUsersInput extends Partial<PageRequest> {
    includeInactive?: boolean;
    /** Trecho do nome, username ou email. */
    search?: string;
}

@Injectable()
export class ListUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: ListUsersInput = {}): Promise<Page<User>> {
        return this.userRepository.findAll({
            ...pageRequest(input),
            includeInactive: input.includeInactive ?? false,
            search: input.search,
        });
    }
}
