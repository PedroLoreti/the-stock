export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Página pedida pelo cliente (1-based). */
export interface PageRequest {
    page: number;
    pageSize: number;
}

/** Fatia de uma listagem mais o total, para o cliente montar a navegação. */
export interface Page<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
}

export function pageRequest(input: Partial<PageRequest> = {}): PageRequest {
    return {
        page: Math.max(1, input.page ?? 1),
        pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE)),
    };
}

export function skipOf({ page, pageSize }: PageRequest): number {
    return (page - 1) * pageSize;
}

/** Pagina uma lista já carregada; usado pelos repositórios em memória dos testes. */
export function paginateArray<T>(all: readonly T[], request: PageRequest): Page<T> {
    const skip = skipOf(request);
    return {
        items: all.slice(skip, skip + request.pageSize),
        page: request.page,
        pageSize: request.pageSize,
        total: all.length,
    };
}

export function mapPage<T, U>(page: Page<T>, mapper: (item: T) => U): Page<U> {
    return { ...page, items: page.items.map(mapper) };
}
