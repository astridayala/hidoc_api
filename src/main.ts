// main.ts (Nest)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
     origin: [
    /http:\/\/localhost:\d+$/,            // permite PUERTOS aleatorios de Flutter web
    'http://127.0.0.1:8080',
    'http://localhost:8080',
  ], 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // Bearer en header
    maxAge: 3600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = new DocumentBuilder()
    .setTitle('Clinica API')
    .setDescription('API HiDoc- aplicación para democratizar el acceso a servicios de salud.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Endpoints de usuarios')
    .addTag('patients', 'Endpoints de pacientes')
    .addTag('medical_record', 'Endpoints de historial')
    .addTag('conditions', 'Endpoints para condiciones')
    .addTag('medical_record_conditions', 'Endpoints de historial medico y condicion')
    .addTag('treatments', 'Endpoints de tratamientos')
    .addTag('treatment_types', 'Endpoints para los tipos de tratamientos')
    .addTag('treatment_statuses', 'Endpoints para los estados de los tratamientos (admin)')
    .addTag('procedures', 'Endpoints para procedimientos')
    .addTag('payments', 'Endpoints para pagos')
    .addTag('appointments', 'Endpoints para als citas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;

  // (Opcional) Si alguien probará desde otro dispositivo en la LAN:
  // await app.listen(port, '0.0.0.0');
  // console.log(`Servidor iniciado en: http://<IP-LAN>:${port}`);

  await app.listen(port);
  console.log(`Servidor iniciado en: http://localhost:${port}`);
  console.log(`Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();