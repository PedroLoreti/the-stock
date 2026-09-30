import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupApp } from './app-setup.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        instrument: ObserveInstrument,
    });
    setupApp(app);
    await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
