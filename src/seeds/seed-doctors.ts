import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data_source/database/app-data-source';
import { User, UserRole } from '../users/entities/user.entity';
import { Patient, PatientGender } from '../users/entities/patient.entity';

async function upsertDoctor(email: string, name: string, password: string) {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) { console.log(`• Doctor ya existe: ${email}`); return existing; }

  const hash = await bcrypt.hash(password, 10);
  const saved = await userRepo.save(
    userRepo.create({ email, name, role: UserRole.Doctor, password: hash }),
  );
  console.log(`✓ Doctor creado: ${saved.email}`);
  return saved;
}

async function upsertPatient(email: string, name: string, password: string) {
  const userRepo = AppDataSource.getRepository(User);
  const patientRepo = AppDataSource.getRepository(Patient);

  let user = await userRepo.findOne({ where: { email } });
  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = await userRepo.save(
      userRepo.create({ email, name, role: UserRole.Paciente, password: hash }),
    );
    console.log(`✓ Usuario paciente creado: ${user.email}`);
  } else {
    console.log(`• Usuario paciente ya existe: ${user.email}`);
  }

  const existingPatient = await patientRepo.findOne({ where: { email } });
  if (!existingPatient) {
    const [first, ...rest] = name.split(' ');
    const entity = patientRepo.create({
      name: first || name,
      lastName: rest.join(' ') || 'Paciente',
      email,
      birthDate: new Date('1995-01-01'),
      gender: PatientGender.Masculino,
      address: 'Dirección de prueba',
    });
    await patientRepo.save(entity);
    console.log(`✓ Paciente creado para: ${email}`);
  } else {
    console.log(`• Paciente ya existe para: ${email}`);
  }
}

async function main() {
  await AppDataSource.initialize();
  console.log('✅ Conectado a la base de datos');

  await upsertDoctor('maria@hidoc.com',  'Dra. María López',  '123456');
  await upsertDoctor('carlos@hidoc.com', 'Dr. Carlos Ruiz',   '123456');
  await upsertDoctor('andres@hidoc.com', 'Dr. Andrés Gómez',  '123456');

  await upsertPatient('juan@hidoc.com', 'Juan Pérez', '123456');

  await AppDataSource.destroy();
  console.log('🎉 Seed completado.');
}

main().catch(async (err) => { console.error('❌ Error en seed:', err); try { await AppDataSource.destroy(); } catch {} process.exit(1); });