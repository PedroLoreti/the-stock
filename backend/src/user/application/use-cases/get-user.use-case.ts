import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export interface GetUserInput {
    id: string;
}

@Injectable()
export class GetUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: GetUserInput): Promise<User> {
        const user = await this.userRepository.findById(input.id);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }
}
