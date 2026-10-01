import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Current password is required' })
    currentPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    newPassword: string;
}
