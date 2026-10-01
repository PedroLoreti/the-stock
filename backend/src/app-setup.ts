import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { optionalEnv } from './shared/infrastructure/config/env.js';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter.js';

/**
 * Configuração global da aplicação (middlewares, pipes, filters). Compartilhada entre o
 * `main.ts` e os testes E2E, para que os testes exercitem exatamente o que roda em produção.
 */
export function setupApp(app: INestApplication): INestApplication {
    app.use(helmet());
    app.use(cookieParser());

    // `credentials: true` é necessário para o navegador enviar o cookie de refresh.
    const corsOrigin = optionalEnv('CORS_ORIGIN', '');
    if (corsOrigin) {
        app.enableCors({ origin: corsOrigin.split(',').map((origin) => origin.trim()), credentials: true });
    }

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    return app;
}
