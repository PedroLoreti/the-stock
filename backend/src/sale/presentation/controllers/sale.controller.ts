import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator.js';
import { PageResponseDto } from '../../../shared/presentation/dtos/page.response.dto.js';
import { PaginationQueryDto } from '../../../shared/presentation/dtos/pagination.query.dto.js';
import { UserRole } from '../../../user/domain/entities/user.entity.js';
import { CancelSaleUseCase } from '../../application/use-cases/cancel-sale.use-case.js';
import { CreateSaleUseCase } from '../../application/use-cases/create-sale.use-case.js';
import { GetSaleUseCase } from '../../application/use-cases/get-sale.use-case.js';
import { ListSalesUseCase } from '../../application/use-cases/list-sales.use-case.js';
import { CreateSaleRequestDto } from '../dtos/create-sale.request.dto.js';
import { SaleResponseDto } from '../dtos/sale.response.dto.js';

/** Qualquer usuário autenticado vende e consulta; só gestão e admin cancelam. */
@Controller('sales')
export class SaleController {
    constructor(
        private readonly createSale: CreateSaleUseCase,
        private readonly cancelSale: CancelSaleUseCase,
        private readonly getSale: GetSaleUseCase,
        private readonly listSales: ListSalesUseCase,
    ) {}

    @Post()
    async create(@Body() body: CreateSaleRequestDto, @CurrentUser() user: CurrentUser): Promise<SaleResponseDto> {
        const sale = await this.createSale.execute({ userId: user.id, items: body.items });
        return SaleResponseDto.fromEntity(sale);
    }

    @Get()
    async list(@Query() query: PaginationQueryDto): Promise<PageResponseDto<SaleResponseDto>> {
        const page = await this.listSales.execute(query);
        return PageResponseDto.from(page, SaleResponseDto.fromEntity);
    }

    @Get(':id')
    async get(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
        const sale = await this.getSale.execute({ id });
        return SaleResponseDto.fromEntity(sale);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.MANAGEMENT, UserRole.ADMIN)
    async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
        const sale = await this.cancelSale.execute({ id });
        return SaleResponseDto.fromEntity(sale);
    }
}
