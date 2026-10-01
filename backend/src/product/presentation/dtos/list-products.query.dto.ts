import { SearchableListQueryDto } from '../../../shared/presentation/dtos/pagination.query.dto.js';

/** `GET /products?page=&pageSize=&search=&includeInactive=` */
export class ListProductsQueryDto extends SearchableListQueryDto {}
