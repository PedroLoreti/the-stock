import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseBoolPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator.js';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case.js';
import { DeactivateUserUseCase } from '../../application/use-cases/deactivate-user.use-case.js';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case.js';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case.js';
import { RestoreUserUseCase } from '../../application/use-cases/restore-user.use-case.js';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case.js';
import { UserRole } from '../../domain/entities/user.entity.js';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto.js';
import { ResetPasswordRequestDto } from '../dtos/reset-password.request.dto.js';
import { UpdateUserRequestDto } from '../dtos/update-user.request.dto.js';
import { UserResponseDto } from '../dtos/user.response.dto.js';

/** Gestão de usuários: exclusiva do administrador. */
@Controller('users')
@Roles(UserRole.ADMIN)
export class UserController {
    constructor(
        private readonly createUser: CreateUserUseCase,
        private readonly listUsers: ListUsersUseCase,
        private readonly getUser: GetUserUseCase,
        private readonly updateUser: UpdateUserUseCase,
        private readonly deactivateUser: DeactivateUserUseCase,
        private readonly restoreUser: RestoreUserUseCase,
        private readonly resetPassword: ResetPasswordUseCase,
    ) {}

    @Post()
    async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
        const user = await this.createUser.execute(body);
        return UserResponseDto.fromEntity(user);
    }

    @Get()
    async list(
        @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe) includeInactive: boolean,
    ): Promise<UserResponseDto[]> {
        const users = await this.listUsers.execute({ includeInactive });
        return users.map(UserResponseDto.fromEntity);
    }

    @Get(':id')
    async get(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
        const user = await this.getUser.execute({ id });
        return UserResponseDto.fromEntity(user);
    }

    @Patch(':id')
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserRequestDto): Promise<UserResponseDto> {
        const user = await this.updateUser.execute({ id, ...body });
        return UserResponseDto.fromEntity(user);
    }

    @Delete(':id')
    async deactivate(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() actor: CurrentUser,
    ): Promise<UserResponseDto> {
        const user = await this.deactivateUser.execute({ id, actorId: actor.id });
        return UserResponseDto.fromEntity(user);
    }

    @Post(':id/restore')
    @HttpCode(HttpStatus.OK)
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
        const user = await this.restoreUser.execute({ id });
        return UserResponseDto.fromEntity(user);
    }

    @Post(':id/reset-password')
    @HttpCode(HttpStatus.OK)
    async reset(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: ResetPasswordRequestDto,
    ): Promise<UserResponseDto> {
        const user = await this.resetPassword.execute({ id, temporaryPassword: body.temporaryPassword });
        return UserResponseDto.fromEntity(user);
    }
}
