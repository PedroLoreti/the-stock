/**
 * Contrato para hash de senha. A implementação real usa bcrypt; os testes usam um fake
 * instantâneo, porque o bcrypt é propositalmente lento.
 */
export abstract class PasswordHasher {
    abstract hash(plain: string): Promise<string>;
    abstract compare(plain: string, hash: string): Promise<boolean>;
}
