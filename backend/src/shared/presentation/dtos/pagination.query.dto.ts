import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../application/pagination.js';

/** Query string comum às listagens: `?page=2&pageSize=20`. */
export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'page must be an integer' })
    @Min(1, { message: 'page must be at least 1' })
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'pageSize must be an integer' })
    @Min(1, { message: 'pageSize must be at least 1' })
    @Max(MAX_PAGE_SIZE, { message: `pageSize must be at most ${MAX_PAGE_SIZE}` })
    pageSize: number = DEFAULT_PAGE_SIZE;
}

/** Listagens com busca textual e filtro de inativos (produtos e usuários). */
export class SearchableListQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'search must have at most 100 characters' })
    search?: string;

    /** Vem como string na query string; aceita só "true"/"false". */
    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
    @IsBoolean({ message: 'includeInactive must be true or false' })
    includeInactive: boolean = false;
}
