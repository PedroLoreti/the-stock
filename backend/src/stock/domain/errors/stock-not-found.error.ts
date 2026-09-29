import { DomainError } from './domain.error.js';

export class StockNotFoundError extends DomainError {
  constructor() {
    super('Stock not found');
  }
}
