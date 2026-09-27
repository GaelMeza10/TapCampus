import 'dotenv/config'; //para que se cargue el .env
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //elimina un campo en la peticion que este de mas
      forbidNonWhitelisted: true, //lanza el error si hay un campo de mas en la peticion
    }),
  );
  app.enableCors(); // Por si acaso también activamos CORS
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
