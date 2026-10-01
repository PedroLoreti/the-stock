import { Module } from '@nestjs/common';
import { PasswordHasher } from './application/ports/password-hasher.js';
import { BootstrapAdminUseCase } from './application/use-cases/bootstrap-admin.use-case.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case.js';
import { GetUserUseCase } from './application/use-cases/get-user.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case.js';
import { RestoreUserUseCase } from './application/use-cases/restore-user.use-case.js';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { BootstrapAdminRunner } from './infrastructure/bootstrap-admin.runner.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher.js';
import { UserController } from './presentation/controllers/user.controller.js';

@Module({
    controllers: [UserController],
    providers: [
        { provide: UserRepository, useClass: PrismaUserRepository },
        { provide: PasswordHasher, useClass: BcryptPasswordHasher },
        BootstrapAdminUseCase,
        BootstrapAdminRunner,
        CreateUserUseCase,
        ListUsersUseCase,
        GetUserUseCase,
        UpdateUserUseCase,
        DeactivateUserUseCase,
        RestoreUserUseCase,
        ResetPasswordUseCase,
    ],
    exports: [UserRepository, PasswordHasher],
})
export class UserModule {}
