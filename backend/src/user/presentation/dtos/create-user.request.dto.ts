import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../../domain/entities/user.entity.js';

export class CreateUserRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    /** Senha temporária; o usuário é obrigado a trocá-la no primeiro login. */
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsIn(Object.values(UserRole), { message: 'Role must be ADMIN, MANAGEMENT or SELLER' })
    role: UserRole;
}
