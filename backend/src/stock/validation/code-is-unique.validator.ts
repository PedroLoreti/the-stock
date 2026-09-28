import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { StockRepository } from "../stock.repository.js";
import { Injectable } from "@nestjs/common";
@Injectable()
@ValidatorConstraint({ async: true })
export class CodeIsUniqueValidator implements ValidatorConstraintInterface {
    constructor(private stockRepository: StockRepository) {}

    async validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> {
        const codeExists = await this.stockRepository.codeExists(value);
        return !codeExists
    }
}

export const CodeIsUnique = (validationOptions: ValidationOptions) => {
    return (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: CodeIsUniqueValidator,
        })
    }

}