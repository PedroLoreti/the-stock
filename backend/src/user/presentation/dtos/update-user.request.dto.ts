import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../domain/entities/user.entity.js';

export class UpdateUserRequestDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Name cannot be empty' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email is invalid' })
    email?: string;

    @IsOptional()
    @IsIn(Object.values(UserRole), { message: 'Role must be ADMIN, MANAGEMENT or SELLER' })
    role?: UserRole;
}
