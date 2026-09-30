import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { CannotDeactivateSelfError } from '../../domain/errors/cannot-deactivate-self.error.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export interface DeactivateUserInput {
    id: string;
    /** Quem está executando a ação; ninguém pode desativar a si mesmo. */
    actorId: string;
}

@Injectable()
export class DeactivateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: DeactivateUserInput): Promise<User> {
        if (input.id === input.actorId) {
            throw new CannotDeactivateSelfError();
        }

        const user = await this.userRepository.findById(input.id);
        if (!user) {
            throw new UserNotFoundError();
        }

        user.deactivate();
        await this.userRepository.save(user);

        return user;
    }
}
