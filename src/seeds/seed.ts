import * as bcrypt from 'bcrypt';
import dataSource from '../data_source/data_source';
import { User, UserRole } from '../users/entities/user.entity';
import { Condition } from '../conditions/condition.entity';
import { TreatmentType } from '../treatments_types/treatment_type.entity';
import { TreatmentStatus } from '../treatment_statuses/treatment_status.entity';
import { Patient, PatientGender } from '../users/entities/patient.entity';
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
        role: UserRole.Paciente,
      },
    ]);
    console.log('Usuarios creados');

    console.log('Creando paciente...');
    await dataSource.getRepository(Patient).save({
      name: 'Astrid Violeta',
      lastName: 'Ayala Ayala',
      phone: '+50323568953',
      email: 'astriayala06@gmail.com',
      birthDate: new Date('2004-10-06'),
      gender: PatientGender.Femenino, // usa el enum para cuadrar tipos
      address:
        'B° Morazán, Calle Zeledón, Cuyultitán, La Paz Oeste, La Paz',
    });
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
      { name: 'Aparatología interceptiva' },
      { name: 'Guarda oclusal' },
      { name: 'Mantenedor de espacio' },
      { name: 'Frenectomía lingual' },
      { name: 'Frenectomía labial superior' },
      { name: 'Frenectomía labial inferior' },
      { name: 'Prótesis removible' },
      { name: 'Prótesis fija' },
      { name: 'Prótesis completa' },
      { name: 'Cirugía cordal: 1-8' },
      { name: 'Cirugía cordal: 2-8' },
      { name: 'Cirugía cordal: 3-8' },
      { name: 'Cirugía cordal: 4-8' },
      { name: 'Canino retenido: 1-3' },
      { name: 'Canino retenido: 2-3' },
      { name: 'Canino retenido: 3-3' },
      { name: 'Canino retenido: 4-3' },
      { name: 'Pulpotomía: 1-1' },
      { name: 'Pulpotomía: 1-2' },
      { name: 'Pulpotomía: 1-3' },
      { name: 'Pulpotomía: 1-4' },
      { name: 'Pulpotomía: 1-5' },
      { name: 'Pulpotomía: 2-1' },
      { name: 'Pulpotomía: 2-2' },
      { name: 'Pulpotomía: 2-3' },
      { name: 'Pulpotomía: 2-4' },
      { name: 'Pulpotomía: 2-5' },
      { name: 'Pulpotomía: 3-1' },
      { name: 'Pulpotomía: 3-2' },
      { name: 'Pulpotomía: 3-3' },
      { name: 'Pulpotomía: 3-4' },
      { name: 'Pulpotomía: 3-5' },
      { name: 'Pulpotomía: 4-1' },
      { name: 'Pulpotomía: 4-2' },
      { name: 'Pulpotomía: 4-3' },
      { name: 'Pulpotomía: 4-4' },
      { name: 'Pulpotomía: 4-5' },
      { name: 'Pulpectomía: 1-1' },
      { name: 'Pulpectomía: 1-2' },
      { name: 'Pulpectomía: 1-3' },
      { name: 'Pulpectomía: 1-4' },
      { name: 'Pulpectomía: 1-5' },
      { name: 'Pulpectomía: 2-1' },
      { name: 'Pulpectomía: 2-2' },
      { name: 'Pulpectomía: 2-3' },
      { name: 'Pulpectomía: 2-4' },
      { name: 'Pulpectomía: 2-5' },
      { name: 'Pulpectomía: 3-1' },
      { name: 'Pulpectomía: 3-2' },
      { name: 'Pulpectomía: 3-3' },
      { name: 'Pulpectomía: 3-4' },
      { name: 'Pulpectomía: 3-5' },
      { name: 'Pulpectomía: 4-1' },
      { name: 'Pulpectomía: 4-2' },
      { name: 'Pulpectomía: 4-3' },
      { name: 'Pulpectomía: 4-4' },
      { name: 'Pulpectomía: 4-5' },
      { name: 'Extracción: 1-1' },
      { name: 'Extracción: 1-2' },
      { name: 'Extracción: 1-3' },
      { name: 'Extracción: 1-4' },
      { name: 'Extracción: 1-5' },
      { name: 'Extracción: 1-6' },
      { name: 'Extracción: 1-7' },
      { name: 'Extracción: 2-1' },
      { name: 'Extracción: 2-2' },
      { name: 'Extracción: 2-3' },
      { name: 'Extracción: 2-4' },
      { name: 'Extracción: 2-5' },
      { name: 'Extracción: 2-6' },
      { name: 'Extracción: 2-7' },
      { name: 'Extracción: 3-1' },
      { name: 'Extracción: 3-2' },
      { name: 'Extracción: 3-3' },
      { name: 'Extracción: 3-4' },
      { name: 'Extracción: 3-5' },
      { name: 'Extracción: 3-6' },
      { name: 'Extracción: 3-7' },
      { name: 'Extracción: 4-1' },
      { name: 'Extracción: 4-2' },
      { name: 'Extracción: 4-3' },
      { name: 'Extracción: 4-4' },
      { name: 'Extracción: 4-5' },
      { name: 'Extracción: 4-6' },
      { name: 'Extracción: 4-7' },
      { name: 'Endodoncia: 1-1' },
      { name: 'Endodoncia: 1-2' },
      { name: 'Endodoncia: 1-3' },
      { name: 'Endodoncia: 1-4' },
      { name: 'Endodoncia: 1-5' },
      { name: 'Endodoncia: 1-6' },
      { name: 'Endodoncia: 1-7' },
      { name: 'Endodoncia: 1-8' },
      { name: 'Endodoncia: 2-1' },
      { name: 'Endodoncia: 2-2' },
      { name: 'Endodoncia: 2-3' },
      { name: 'Endodoncia: 2-4' },
      { name: 'Endodoncia: 2-5' },
      { name: 'Endodoncia: 2-6' },
      { name: 'Endodoncia: 2-7' },
      { name: 'Endodoncia: 2-8' },
      { name: 'Endodoncia: 3-1' },
      { name: 'Endodoncia: 3-2' },
      { name: 'Endodoncia: 3-3' },
      { name: 'Endodoncia: 3-4' },
      { name: 'Endodoncia: 3-5' },
      { name: 'Endodoncia: 3-6' },
      { name: 'Endodoncia: 3-7' },
      { name: 'Endodoncia: 3-8' },
      { name: 'Endodoncia: 4-1' },
      { name: 'Endodoncia: 4-2' },
      { name: 'Endodoncia: 4-3' },
      { name: 'Endodoncia: 4-4' },
      { name: 'Endodoncia: 4-5' },
      { name: 'Endodoncia: 4-6' },
      { name: 'Endodoncia: 4-7' },
      { name: 'Endodoncia: 4-8' },
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