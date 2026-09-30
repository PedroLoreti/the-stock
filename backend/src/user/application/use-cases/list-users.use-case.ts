import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export interface ListUsersInput {
    includeInactive?: boolean;
}

@Injectable()
export class ListUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: ListUsersInput = {}): Promise<User[]> {
        return this.userRepository.findAll({ includeInactive: input.includeInactive ?? false });
    }
}
