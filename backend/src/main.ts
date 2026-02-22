import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Debug Middleware: Log every request
  app.use((req, res, next) => {
    logger.log(`[INCOMING] ${req.method} ${req.url} from ${req.headers.origin}`);
    next();
  });

  // Enable CORS with explicit permissive settings
  app.enableCors({
    origin: true, // Allow any origin (reflects request origin)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Listen on 0.0.0.0 to ensure accessibility
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
