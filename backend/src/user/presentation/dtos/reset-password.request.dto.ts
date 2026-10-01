import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Temporary password is required' })
    temporaryPassword: string;
}
