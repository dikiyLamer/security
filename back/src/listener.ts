
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
// import { ZeebeServer } from 'nestjs-zeebe';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
//   const microservice = app.connectMicroservice({
//     strategy: app.get(ZeebeServer),
//   });
  app.enableCors({allowedHeaders:'*'})
  await app.startAllMicroservices();
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();