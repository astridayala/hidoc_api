import * as bcrypt from 'bcrypt';
import dataSource from '../data_source/data_source';
import { User, UserRole } from '../users/entities/user.entity';
import { Patient, PatientGender } from '../users/entities/patient.entity'; 
import { Condition } from '../conditions/condition.entity';
import { TreatmentType } from '../treatments_types/treatment_type.entity';
import { TreatmentStatus } from '../treatment_statuses/treatment_status.entity';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.ENV_FILE || '.env' });

async function main() {
  console.log('Iniciando proceso de seeding...');
  try {
    await dataSource.initialize();
    console.log('Conexión a la base de datos establecida');
    
    const adminPassword = await bcrypt.hash('pato04', 10);
    const doctorPassword = await bcrypt.hash('cabezas04', 10);
    const pacientePassword = await bcrypt.hash('astri04', 10);
    
    console.log('Creando usuarios iniciales...');
    await dataSource.getRepository(User).save([
      {
        name: 'Valeria Castro',
        email: 'valeria.castro@gmail.com',
        password: adminPassword,
        // Si no manejas admin en el enum, usa Doctor.
        role: UserRole.Doctor,
      },
      {
        name: 'Diego Cabezas',
        email: 'diego.cabezas@gmail.com',
        password: doctorPassword,
        role: UserRole.Doctor,
      },
      {
        name: 'Astrid Ayala',
        email: 'astrid.ayala@gmail.com',
        password: pacientePassword,
        role: 'paciente',
      }
    ]);
    console.log('Usuarios creados');

    console.log('Creando paciente...');
    await dataSource.getRepository(Patient).save(
      dataSource.getRepository(Patient).create({
        name: 'Astrid Violeta',
        lastName: 'Ayala Ayala',
        phone: '+50323568953',
        email: 'astriayala06@gmail.com',
        birthDate: new Date('2004-10-06'),
        gender: PatientGender.Femenino, // usa enum si existe
        address: 'B° Morazán, Calle Zeledón, Cuyultitán, La Paz Oeste, La Paz',
      })
    );
    console.log('Paciente creado');

    console.log('Creando condiciones...');
    await dataSource.getRepository(Condition).save([
      { name: 'Diabetes' },
      { name: 'Hipertensión' },
      { name: 'Alergia Ibuprofeno' },
      { name: 'Osteoporosis' },
      { name: 'Insuficiencia Renal' },
      { name: 'Tiroides' },
      { name: 'Problemas cardíacos' },
      { name: 'Artitris' },
      { name: 'Lupus' },
      { name: 'Anemia' },
      { name: 'Cáncer' },
    ]);
    console.log('Padecimientos creados');

    console.log('Creando tipos de tratamientos...');
    await dataSource.getRepository(TreatmentType).save([
      { name: 'Consultas' },
      // ... (resto)
    ]);
    console.log('Tipos de tratamientos creados');

    console.log('Creando estados de tratamientos...');
    await dataSource.getRepository(TreatmentStatus).save([
      { name: 'Activo', orderPriority: 1 },
      { name: 'Referido', orderPriority: 2 },
      { name: 'Finalizado', orderPriority: 3 },
    ]);
    console.log('Estados de tratamientos creados');

    console.log('Proceso de seeding completado exitosamente');
  } catch (error) {
    console.error('Error durante el proceso de seeding:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Conexión a la base de datos cerrada');
    }
  }
}

main();