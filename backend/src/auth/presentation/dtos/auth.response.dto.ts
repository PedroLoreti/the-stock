import { User } from '../../../user/domain/entities/user.entity.js';
import { UserResponseDto } from '../../../user/presentation/dtos/user.response.dto.js';

/** O refresh token não aparece aqui: ele viaja só no cookie httpOnly. */
export class AuthResponseDto {
    constructor(
        readonly accessToken: string,
        readonly mustChangePassword: boolean,
        readonly user: UserResponseDto,
    ) {}

    static from(accessToken: string, user: User): AuthResponseDto {
        return new AuthResponseDto(accessToken, user.mustChangePassword, UserResponseDto.fromEntity(user));
    }
}
