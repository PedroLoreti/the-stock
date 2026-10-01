import { SearchableListQueryDto } from '../../../shared/presentation/dtos/pagination.query.dto.js';

/** `GET /users?page=&pageSize=&search=&includeInactive=` */
export class ListUsersQueryDto extends SearchableListQueryDto {}
