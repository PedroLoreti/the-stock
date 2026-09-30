import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CancelSaleUseCase } from '../../application/use-cases/cancel-sale.use-case.js';
import { CreateSaleUseCase } from '../../application/use-cases/create-sale.use-case.js';
import { GetSaleUseCase } from '../../application/use-cases/get-sale.use-case.js';
import { ListSalesUseCase } from '../../application/use-cases/list-sales.use-case.js';
import { CreateSaleRequestDto } from '../dtos/create-sale.request.dto.js';
import { SaleResponseDto } from '../dtos/sale.response.dto.js';

@Controller('sales')
export class SaleController {
    constructor(
        private readonly createSale: CreateSaleUseCase,
        private readonly cancelSale: CancelSaleUseCase,
        private readonly getSale: GetSaleUseCase,
        private readonly listSales: ListSalesUseCase,
    ) {}

    @Post()
    async create(@Body() body: CreateSaleRequestDto): Promise<SaleResponseDto> {
        const sale = await this.createSale.execute(body);
        return SaleResponseDto.fromEntity(sale);
    }

    @Get()
    async list(): Promise<SaleResponseDto[]> {
        const sales = await this.listSales.execute();
        return sales.map(SaleResponseDto.fromEntity);
    }

    @Get(':id')
    async get(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
        const sale = await this.getSale.execute({ id });
        return SaleResponseDto.fromEntity(sale);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<SaleResponseDto> {
        const sale = await this.cancelSale.execute({ id });
        return SaleResponseDto.fromEntity(sale);
    }
}
