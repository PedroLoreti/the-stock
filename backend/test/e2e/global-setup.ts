import { execSync } from 'node:child_process';
import { config } from 'dotenv';

/**
 * Esvazia todas as tabelas que existirem (menos o histórico de migrations).
 * Dinâmico para funcionar tanto num banco recém-criado quanto num já migrado.
 */
const TRUNCATE_EVERYTHING = `
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations' LOOP
    EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
  END LOOP;
END $$;`;

export default function globalSetup(): void {
    const { parsed } = config({ path: '.env.test', override: true });
    const databaseUrl = parsed?.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL não encontrado em .env.test (veja .env.test.example)');
    }
    if (!/_test(\?|$)/.test(databaseUrl)) {
        throw new Error(`Por segurança, o banco de E2E precisa terminar em "_test". Recebido: ${databaseUrl}`);
    }

    const env = { ...process.env, DATABASE_URL: databaseUrl };

    // Limpa antes de migrar: migrations que adicionam colunas NOT NULL só aplicam em tabelas vazias.
    execSync('npx prisma db execute --stdin', { env, input: TRUNCATE_EVERYTHING });
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
}
