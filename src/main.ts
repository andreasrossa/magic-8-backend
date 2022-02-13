import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DefaultLogger } from './logger/default-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Magic-8-Ball API')
    .setDescription('API Documentation for the magic 8 ball server.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useLogger(app.get(DefaultLogger));

  await app.listen(3000);
}
bootstrap();
