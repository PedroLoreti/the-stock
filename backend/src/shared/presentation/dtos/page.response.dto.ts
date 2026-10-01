import { Page } from '../../application/pagination.js';

export class PageMetaDto {
    constructor(
        readonly page: number,
        readonly pageSize: number,
        readonly total: number,
        readonly totalPages: number,
    ) {}
}

/** Envelope padrão das listagens paginadas: `{ data: [...], meta: { page, pageSize, total, totalPages } }`. */
export class PageResponseDto<T> {
    constructor(
        readonly data: T[],
        readonly meta: PageMetaDto,
    ) {}

    static from<E, T>(page: Page<E>, mapItem: (item: E) => T): PageResponseDto<T> {
        return new PageResponseDto(
            page.items.map(mapItem),
            new PageMetaDto(page.page, page.pageSize, page.total, Math.max(1, Math.ceil(page.total / page.pageSize))),
        );
    }
}
