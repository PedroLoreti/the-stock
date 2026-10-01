import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/ports/password-hasher.js';

/** Custo 12: ~250 ms por hash em hardware comum, caro o bastante contra força bruta. */
const SALT_ROUNDS = 12;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
    hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, SALT_ROUNDS);
    }

    compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
