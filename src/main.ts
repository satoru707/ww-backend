import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';
import helmet from 'helmet';
import { safeErrorMessage } from './common/error.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: new ConsoleLogger({ json: true, colors: true }),
    // ['error', 'warn'],
  });
  app.use(helmet());
  // cookie-parser's exported value can be typed differently depending on TS config.
  // Narrow it to a factory returning an Express RequestHandler so ESLint/TS accept the call.
  const cookieParserFactory = cookieParser as unknown as () => RequestHandler;
  app.use(cookieParserFactory());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = new DocumentBuilder()
    .setTitle('Wealth Wave')
    .setDescription('API documentation for wealth wave')
    .setVersion('1.0')
    .addSecurity('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .addSecurity('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'api/docs/json',
  });
  await app.listen(process.env.PORT ?? 3000);
}

void (async () => {
  try {
    await bootstrap();
  } catch (err: unknown) {
    // log and exit on bootstrap failure
    console.error('Application bootstrap failed', safeErrorMessage(err));
    process.exit(1);
  }
})();
