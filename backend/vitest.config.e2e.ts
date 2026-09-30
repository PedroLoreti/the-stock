import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        root: './',
        include: ['**/*.e2e-spec.ts'],
        // Carrega o .env.test em cada worker, antes de qualquer import da aplicação.
        setupFiles: ['./test/e2e/setup-env.ts'],
        // Cria/atualiza o schema do banco de teste uma vez, antes de tudo.
        globalSetup: ['./test/e2e/global-setup.ts'],
        // Todos os arquivos compartilham o mesmo banco: não podem rodar em paralelo.
        fileParallelism: false,
        testTimeout: 30_000,
        hookTimeout: 60_000,
    },
});
