import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  console.log(`Spatial Intelligence Platform API active at http://localhost:${port}/api/v1`);
}

bootstrap();
