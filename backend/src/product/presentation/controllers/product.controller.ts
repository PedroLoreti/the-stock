import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator.js';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator.js';
import { PageResponseDto } from '../../../shared/presentation/dtos/page.response.dto.js';
import { UserRole } from '../../../user/domain/entities/user.entity.js';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case.js';
import { DeactivateProductUseCase } from '../../application/use-cases/deactivate-product.use-case.js';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case.js';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case.js';
import { ListStockMovementsUseCase } from '../../application/use-cases/list-stock-movements.use-case.js';
import { RegisterStockEntryUseCase } from '../../application/use-cases/register-stock-entry.use-case.js';
import { RestoreProductUseCase } from '../../application/use-cases/restore-product.use-case.js';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case.js';
import { CreateProductRequestDto } from '../dtos/create-product.request.dto.js';
import { ListProductsQueryDto } from '../dtos/list-products.query.dto.js';
import { ProductResponseDto } from '../dtos/product.response.dto.js';
import { RegisterStockEntryRequestDto } from '../dtos/register-stock-entry.request.dto.js';
import { StockMovementResponseDto } from '../dtos/stock-movement.response.dto.js';
import { UpdateProductRequestDto } from '../dtos/update-product.request.dto.js';

/**
 * Leitura: qualquer usuário autenticado. Escrita: gestão e admin.
 * Restaurar um produto desativado: só admin.
 */
@Controller('products')
export class ProductController {
    constructor(
        private readonly createProduct: CreateProductUseCase,
        private readonly listProducts: ListProductsUseCase,
        private readonly getProduct: GetProductUseCase,
        private readonly updateProduct: UpdateProductUseCase,
        private readonly deactivateProduct: DeactivateProductUseCase,
        private readonly restoreProduct: RestoreProductUseCase,
        private readonly registerStockEntry: RegisterStockEntryUseCase,
        private readonly listStockMovements: ListStockMovementsUseCase,
    ) {}

    @Post()
    @Roles(UserRole.MANAGEMENT, UserRole.ADMIN)
    async create(@Body() body: CreateProductRequestDto): Promise<ProductResponseDto> {
        const product = await this.createProduct.execute(body);
        return ProductResponseDto.fromEntity(product);
    }

    @Get()
    async list(
        @Query() query: ListProductsQueryDto,
        @CurrentUser() user: CurrentUser,
    ): Promise<PageResponseDto<ProductResponseDto>> {
        const page = await this.listProducts.execute({ ...query, requesterRole: user.role });
        return PageResponseDto.from(page, ProductResponseDto.fromEntity);
    }

    @Get(':id')
    async get(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
        const product = await this.getProduct.execute({ id });
        return ProductResponseDto.fromEntity(product);
    }

    @Patch(':id')
    @Roles(UserRole.MANAGEMENT, UserRole.ADMIN)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateProductRequestDto,
    ): Promise<ProductResponseDto> {
        const product = await this.updateProduct.execute({ id, ...body });
        return ProductResponseDto.fromEntity(product);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGEMENT, UserRole.ADMIN)
    async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
        const product = await this.deactivateProduct.execute({ id });
        return ProductResponseDto.fromEntity(product);
    }

    @Post(':id/restore')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.ADMIN)
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
        const product = await this.restoreProduct.execute({ id });
        return ProductResponseDto.fromEntity(product);
    }

    @Post(':id/entries')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.MANAGEMENT, UserRole.ADMIN)
    async registerEntry(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: RegisterStockEntryRequestDto,
    ): Promise<ProductResponseDto> {
        const product = await this.registerStockEntry.execute({ productId: id, quantity: body.quantity });
        return ProductResponseDto.fromEntity(product);
    }

    @Get(':id/movements')
    async movements(@Param('id', ParseUUIDPipe) id: string): Promise<StockMovementResponseDto[]> {
        const movements = await this.listStockMovements.execute({ productId: id });
        return movements.map(StockMovementResponseDto.fromEntity);
    }
}
