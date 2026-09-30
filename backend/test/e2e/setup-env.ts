import { config } from 'dotenv';

// `override` garante que o DATABASE_URL do .env.test vence o do .env,
// para os E2E nunca tocarem no banco de desenvolvimento.
config({ path: '.env.test', override: true });
