import { execSync } from 'node:child_process';
import { config } from 'dotenv';

export default function globalSetup(): void {
    const { parsed } = config({ path: '.env.test', override: true });
    const databaseUrl = parsed?.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL não encontrado em .env.test (veja .env.test.example)');
    }
    if (!/_test(\?|$)/.test(databaseUrl)) {
        throw new Error(`Por segurança, o banco de E2E precisa terminar em "_test". Recebido: ${databaseUrl}`);
    }

    execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
    });
}
