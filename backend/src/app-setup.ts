import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter.js';
import helmet from 'helmet';

/**
 * Configuração global da aplicação (pipes, filters). Compartilhada entre o `main.ts`
 * e os testes E2E, para que os testes exercitem exatamente o que roda em produção.
 */
export function setupApp(app: INestApplication): INestApplication {
    app.use(helmet());
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
