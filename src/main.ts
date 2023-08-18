
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { NestApplicationOptions } from '@nestjs/common';

const NEST_LOGGING = false;
async function bootstrap() {
  const opts: NestApplicationOptions = {};
  if (!NEST_LOGGING) { opts.logger = false; }
  admin.initializeApp({
    credential: admin.credential.cert('src/auth/ServiceAccount.json')
  });

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The API TEST')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(process.env.PORT || 8080);

}
export default admin;
bootstrap();
