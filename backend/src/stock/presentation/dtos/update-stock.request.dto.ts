import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateStockRequestDTO {
    @IsNotEmpty({ message: 'Name is required' })
    @IsOptional()
    name: string;

    @IsString({ message: 'Description must be a string' })
    @IsOptional()
    description: string;

    @IsNumber(undefined, { message: 'Quantity must be a number' })
    @Min(1, { message: 'Quantity must be a positive number' })
    @IsOptional()
    quantity: number;

    @IsNumber(undefined, { message: 'Code must be a number' })
    @IsOptional()
    code: number;
}
