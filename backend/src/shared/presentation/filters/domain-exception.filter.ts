import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { InvalidCredentialsError } from '../../../auth/domain/errors/invalid-credentials.error.js';
import { InvalidRefreshTokenError } from '../../../auth/domain/errors/invalid-refresh-token.error.js';
import { PasswordChangeRequiredError } from '../../../auth/domain/errors/password-change-required.error.js';
import { CannotDeactivateSelfError } from '../../../user/domain/errors/cannot-deactivate-self.error.js';
import { EmailAlreadyExistsError } from '../../../user/domain/errors/email-already-exists.error.js';
import { UserNotFoundError } from '../../../user/domain/errors/user-not-found.error.js';
import { UsernameAlreadyExistsError } from '../../../user/domain/errors/username-already-exists.error.js';
import { ConcurrencyError } from '../../domain/concurrency.error.js';
import { DomainError } from '../../domain/domain.error.js';
import { ForbiddenActionError } from '../../domain/forbidden-action.error.js';
import { InsufficientStockError } from '../../../product/domain/errors/insufficient-stock.error.js';
import { ProductInactiveError } from '../../../product/domain/errors/product-inactive.error.js';
import { ProductNotFoundError } from '../../../product/domain/errors/product-not-found.error.js';
import { SkuAlreadyExistsError } from '../../../product/domain/errors/sku-already-exists.error.js';
import { SaleAlreadyCancelledError } from '../../../sale/domain/errors/sale-already-cancelled.error.js';
import { SaleCancellationWindowExpiredError } from '../../../sale/domain/errors/sale-cancellation-window-expired.error.js';
import { SaleNotFoundError } from '../../../sale/domain/errors/sale-not-found.error.js';

/**
 * Traduz erros de domínio para status HTTP. O domínio não sabe que HTTP existe;
 * esta é a única camada que conhece os dois lados.
 */
const STATUS_BY_ERROR: ReadonlyArray<[abstract new (...args: never[]) => DomainError, HttpStatus]> = [
    [ProductNotFoundError, HttpStatus.NOT_FOUND],
    [SaleNotFoundError, HttpStatus.NOT_FOUND],
    [UserNotFoundError, HttpStatus.NOT_FOUND],
    [SkuAlreadyExistsError, HttpStatus.CONFLICT],
    [UsernameAlreadyExistsError, HttpStatus.CONFLICT],
    [EmailAlreadyExistsError, HttpStatus.CONFLICT],
    [ConcurrencyError, HttpStatus.CONFLICT],
    [InvalidCredentialsError, HttpStatus.UNAUTHORIZED],
    [InvalidRefreshTokenError, HttpStatus.UNAUTHORIZED],
    [PasswordChangeRequiredError, HttpStatus.FORBIDDEN],
    [ForbiddenActionError, HttpStatus.FORBIDDEN],
    [CannotDeactivateSelfError, HttpStatus.UNPROCESSABLE_ENTITY],
    [InsufficientStockError, HttpStatus.UNPROCESSABLE_ENTITY],
    [ProductInactiveError, HttpStatus.UNPROCESSABLE_ENTITY],
    [SaleAlreadyCancelledError, HttpStatus.UNPROCESSABLE_ENTITY],
    [SaleCancellationWindowExpiredError, HttpStatus.UNPROCESSABLE_ENTITY],
];

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
    catch(exception: DomainError, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();
        const status = this.resolveStatus(exception);

        response.status(status).json({
            statusCode: status,
            error: exception.name,
            message: exception.message,
        });
    }

    private resolveStatus(exception: DomainError): HttpStatus {
        const match = STATUS_BY_ERROR.find(([errorClass]) => exception instanceof errorClass);
        return match ? match[1] : HttpStatus.BAD_REQUEST;
    }
}
