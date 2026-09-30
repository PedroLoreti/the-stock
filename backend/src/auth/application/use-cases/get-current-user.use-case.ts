import { Injectable } from '@nestjs/common';
import { User } from '../../../user/domain/entities/user.entity.js';
import { UserNotFoundError } from '../../../user/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../../user/domain/repositories/user.repository.js';

export interface GetCurrentUserInput {
    userId: string;
}

@Injectable()
export class GetCurrentUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: GetCurrentUserInput): Promise<User> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }
}
