import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet());

  // Graceful shutdown on SIGINT/SIGTERM
  app.enableShutdownHooks();

  // Global API v1 Prefix (keeps root '/' as a public health check)
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // Global validation — strips unknown fields, transforms types, rejects extra properties
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configurable CORS with clear separation of concerns
  const resolveCorsOrigins = (): string[] | string | boolean => {
    // 1. Check if explicit website URLs are provided in .env
    const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
    if (rawOrigins) {
      return rawOrigins.split(',').map((url) => url.trim());
    }

    // 2. If no URLs are configured, fall back based on environment
    if (process.env.NODE_ENV === 'production') {
      return false; // Security: Block cross-origin browser requests in production
    }

    return '*'; // Convenience: Allow all localhost origins in development
  };

  app.enableCors({
    origin: resolveCorsOrigins(),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Billbolt API running on http://0.0.0.0:${port}`);
  console.log(`📡 Base API URL: http://0.0.0.0:${port}/api/v1`);
}

bootstrap().catch((err: unknown) => {
  console.error('❌ Failed to start Billbolt API:', err);
  process.exit(1);
});
