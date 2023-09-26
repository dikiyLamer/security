import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rmuser:rmpassword@10.11.10.105:5672'], //[process.env.RABBITMQ_ADDRESS],
      queue: 'AUTH',
      queueOptions: {
        durable: false
      },
    },
  })

  app.listen()
}
bootstrap();

