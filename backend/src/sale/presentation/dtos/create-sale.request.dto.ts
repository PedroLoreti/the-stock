import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, IsUUID, ValidateNested } from 'class-validator';

export class CreateSaleItemRequestDto {
    @IsUUID(undefined, { message: 'productId must be a valid UUID' })
    productId: string;

    @IsInt({ message: 'Quantity must be an integer' })
    @IsPositive({ message: 'Quantity must be greater than zero' })
    quantity: number;
}

export class CreateSaleRequestDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Sale must have at least one item' })
    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemRequestDto)
    items: CreateSaleItemRequestDto[];
}
