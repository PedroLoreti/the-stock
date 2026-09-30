import { IsInt, IsPositive } from 'class-validator';

export class RegisterStockEntryRequestDto {
    @IsInt({ message: 'Quantity must be an integer' })
    @IsPositive({ message: 'Quantity must be greater than zero' })
    quantity: number;
}
