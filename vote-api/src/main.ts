
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = path.resolve(__dirname, '../../.env');
const resultDotEnv = dotenv.config({ path: envFile });
if (resultDotEnv.error) {
  console.log(`Error loading .env file ${envFile}`);
}

import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common'
import config from 'config';
import { AppModule } from './app.module';
import { InitDbService } from './database_management/initDB.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from 'interceptors';

function getApiDocDownloadDescription() {
  return {
    get: {
      tags: ['Download OpenAPI JSON'],
      description: 'Download the OpenAPI JSON file description of the API',
      responses: {
        '200': {
          description: 'Successful response',
        },
      },
    },
  };
}

// http://localhost:4000/api/v1/apidoc
function setupSwagger(app: INestApplication, apiPath: string) {
  const apidocConfig = new DocumentBuilder()  
        .setTitle('Savimbo Vote REST API Reference')
        .setVersion('1.0')
        .build();
  const document = SwaggerModule.createDocument(app, apidocConfig);
  document.paths[`${apiPath}/apidoc-json`] = getApiDocDownloadDescription();
  SwaggerModule.setup(`${apiPath}/apidoc`, app, document);
}

async function bootstrap() {
  const apiPath = '/api/v1'
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(apiPath);
  app.enableCors(); // ({ origin: '*',   credentials: true,  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());  // logs to console every call to the API

  setupSwagger(app, apiPath);

  const initDbService = app.get(InitDbService);
  await initDbService.initialize(); // Initialize the database

  await app.listen(4000);
}
bootstrap();
