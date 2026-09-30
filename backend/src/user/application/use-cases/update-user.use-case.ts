import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity.js';
import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists.error.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export interface UpdateUserInput {
    id: string;
    name?: string;
    email?: string;
    role?: UserRole;
}

@Injectable()
export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: UpdateUserInput): Promise<User> {
        const user = await this.userRepository.findById(input.id);
        if (!user) {
            throw new UserNotFoundError();
        }

        if (input.email !== undefined) {
            const email = User.normalizeEmail(input.email);
            const owner = await this.userRepository.findByEmail(email);
            if (owner && owner.id !== user.id) {
                throw new EmailAlreadyExistsError();
            }
        }

        user.update({ name: input.name, email: input.email });
        if (input.role !== undefined) {
            user.changeRole(input.role);
        }
        await this.userRepository.save(user);

        return user;
    }
}
