import { InMemoryProductRepository } from '../../../../test/fakes/in-memory-product.repository.js';
import { makeProduct } from '../../../../test/factories/product.factory.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { RestoreProductUseCase } from './restore-product.use-case.js';

describe('RestoreProductUseCase', () => {
    it('reactivates a deactivated product', async () => {
        const products = new InMemoryProductRepository();
        const product = makeProduct();
        product.deactivate();
        await products.save(product);

        const result = await new RestoreProductUseCase(products).execute({ id: product.id });

        expect(result.active).toBe(true);
        expect((await products.findById(product.id))!.active).toBe(true);
    });

    it('throws when the product does not exist', async () => {
        await expect(
            new RestoreProductUseCase(new InMemoryProductRepository()).execute({ id: 'missing' }),
        ).rejects.toBeInstanceOf(ProductNotFoundError);
    });
});
