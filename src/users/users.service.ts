import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Enum real de BD (minúsculas/español)
type DbRole = 'doctor' | 'paciente' | 'admin';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: DbRole | string;
  professionalId?: string | null;
  specialty?: string;
}

/* ---------------------------------
 * Helpers
 * --------------------------------*/

/** Normaliza el rol que venga del API a tu enum de BD */
function normalizeDbRole(input?: string | null): DbRole {
  const up = String(input ?? '').toUpperCase().trim();
  if (up === 'DOCTOR') return 'doctor';
  if (up === 'PATIENT' || up === 'PACIENTE') return 'paciente';
  if (up === 'ADMIN') return 'admin';
  return 'paciente';
}

/** Deriva first/last name a partir de un full name libre */
function splitFullName(fullName: string): { first: string; last: string } {
  const cleaned = fullName.replace(/\s+/g, ' ').trim();
  if (!cleaned) return { first: '-', last: '-' };

  const parts = cleaned.split(' ');
  if (parts.length === 1) {
    return { first: parts[0], last: '-' }; // placeholder no nulo
  }

  const last = parts.pop() as string;
  const first = parts.join(' ');
  return {
    first: first.length ? first : '-',
    last: last.length ? last : '-',
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly ds: DataSource) {}

  // ======================================================
  // MÉTODOS REQUERIDOS POR AUTH
  // ======================================================

  /** Busca usuario por email (incluye password para validar login) */
  async findByEmail(email: string) {
    const rows = await this.ds.query(
      `SELECT id, email, name, role, password, "createdAt" FROM "user" WHERE email = $1 LIMIT 1`,
      [email],
    );
    return rows[0] || null;
  }

  async findOne(id: string) {
    const rows = await this.ds.query(
      `SELECT id, email, name, role, "createdAt" FROM "user" WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  /**
   * Crea el usuario y, según el rol, crea fila en patient o doctor_profile (transacción).
   * Acepta 'name' como full name y deriva 'lastName' para cumplir NOT NULL.
   */
  async create(data: Partial<CreateUserInput>) {
    if (!data?.email || !data?.password || !data?.name) {
      throw new BadRequestException('Faltan campos para crear usuario');
    }

    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const isBcrypt =
      typeof data.password === 'string' && data.password.startsWith('$2b$');
    const passwordHash = isBcrypt
      ? String(data.password)
      : await bcrypt.hash(String(data.password), 12);

    const role: DbRole = normalizeDbRole(String(data.role ?? ''));
    const { first, last } = splitFullName(String(data.name));

    return await this.ds.transaction(async (trx) => {
      const userRes = await trx.query(
        `INSERT INTO "user"(email, name, role, password)
         VALUES ($1, $2, $3::user_role_enum, $4)
         RETURNING id, email, name, role, "createdAt"`,
        [data.email, data.name, role, passwordHash],
      );
      const user = userRes[0];

      if (role === 'paciente') {
        await trx.query(
          `INSERT INTO "patient"("userId", name, "lastName", email)
           VALUES ($1, $2, $3, $4)`,
          [user.id, first, last, user.email],
        );
      } else if (role === 'doctor') {
        const professionalId = data.professionalId ?? null;
        const specialty = (data as any).specialty ?? 'General';
        const price = 0;
        const rating = 0;
        const about = null;
        const isOnline = false;

        await trx.query(
          `INSERT INTO "doctor_profile" (
             "user_id", "fullName", "specialty", "price", "rating",
             "about", "isOnline", "professionalId"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [user.id, user.name, specialty, price, rating, about, isOnline, professionalId],
        );
      }

      return user;
    });
  }

  // ======================================================
  // PERFIL (me)
  // ======================================================

  async getMe(userId: string) {
    const userRes = await this.ds.query(
      `SELECT id, email, name, role FROM "user" WHERE id = $1 LIMIT 1`,
      [userId],
    );
    const user = userRes[0];
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role !== 'doctor') return user;

    const profileRes = await this.ds.query(
      `SELECT "specialty", "about", "professionalId", "rating"
       FROM "doctor_profile" WHERE "user_id" = $1 LIMIT 1`,
      [userId],
    );
    const profile = profileRes[0] ?? {};

    let total_patients = 0;
    try {
      const statsRes = await this.ds.query(
        `SELECT COUNT(*) as "count"
         FROM "cita_doctor"
         WHERE "doctor_id" = $1 AND status = 'completada'`,
        [userId],
      );
      total_patients = parseInt(statsRes[0]?.count || '0', 10);
    } catch {
      console.warn('Advertencia: No se pudo calcular total_patients.');
    }

    let citas_hoy = 0;
    try {
      const citasRes = await this.ds.query(
        `SELECT COUNT(*) as "count"
         FROM "cita_doctor"
         WHERE "doctor_id" = $1 AND "fecha_cita"::date = CURRENT_DATE`,
        [userId],
      );
      citas_hoy = parseInt(citasRes[0]?.count || '0', 10);
    } catch {
      console.warn('Advertencia: No se pudo calcular citas_hoy.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      specialty: profile.specialty ?? 'Especialidad no definida',
      biography: profile.about ?? 'Sin biografía.',
      license: profile.professionalId ?? 'N/A',
      rating: parseFloat(profile.rating || '0'),
      phone: 'N/A (Agregar a BD)',
      location: 'N/A (Agregar a BD)',
      years_experience: 0,
      schedule: {
        lunes: '09:00 - 17:00',
        martes: '09:00 - 17:00',
        miercoles: '09:00 - 13:00',
      },
      diplomas: [
        { title: 'Medicina General', institution: 'Universidad X', year: '2010' },
      ],
      reviews: [],
      ingresos: [3000, 3200, 2800, 3500],
      total_patients,
      citas_hoy,
    };
  }

  async updateMe(userId: string, dto: { name?: string; email?: string }) {
    if (!dto || (!dto.name && !dto.email)) {
      throw new BadRequestException('Nada para actualizar');
    }

    const sets: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (dto.name) {
      sets.push(`name = $${i++}`);
      params.push(dto.name);
    }

    if (dto.email) {
      const exists = await this.findByEmail(dto.email);
      if (exists && exists.id !== userId) {
        throw new ConflictException('El email ya está en uso');
      }
      sets.push(`email = $${i++}`);
      params.push(dto.email);
    }

    params.push(userId);
    const sql = `UPDATE "user" SET ${sets.join(', ')} WHERE id = $${i}
                 RETURNING id, email, name, role, "createdAt"`;
    const updated = await this.ds.query(sql, params);
    return updated[0];
  }

  // ======================================================
  // HISTORIAL (me/history)
  // ======================================================

  private async findPatientForUserOrNull(user: any) {
    const byUser = await this.ds.query(
      `SELECT * FROM "patient" WHERE "userId" = $1 LIMIT 1`,
      [user.id],
    );
    if (byUser[0]) return byUser[0];

    const byEmail = await this.ds.query(
      `SELECT * FROM "patient" WHERE email = $1 LIMIT 1`,
      [user.email],
    );
    return byEmail[0] || null;
  }

  private async ensureMedicalRecordId(patient: any) {
    const current = patient.medicalRecordId ?? patient.medicalrecordid;
    if (current) return current;

    const rec = await this.ds.query(
      `INSERT INTO "medical_record" DEFAULT VALUES RETURNING id`,
    );
    const recordId = rec[0].id;

    await this.ds.query(
      `UPDATE "patient" SET "medicalRecordId" = $1 WHERE id = $2`,
      [recordId, patient.id],
    );
    return recordId;
  }

  async getMyHistory(user: any) {
    const patient = await this.findPatientForUserOrNull(user);
    if (!patient) {
      return {
        patient: null,
        medicalRecordId: null,
        conditions: [],
        treatments: [],
        procedures: [],
        payments: [],
      };
    }

    const medicalRecordId = await this.ensureMedicalRecordId(patient);

    const [conditions, treatments, procedures, payments] = await Promise.all([
      this.ds.query(
        `SELECT mrc.id, c.id as "conditionId", c.name
         FROM "medical_record_condition" mrc
         JOIN "condition" c ON c.id = mrc."condition_id"
         WHERE mrc."medical_record_id" = $1
         ORDER BY c.name ASC`,
        [medicalRecordId],
      ),

      this.ds.query(
        `SELECT t.id, t."totalPrice", t."startDate", ts.name as status, tt.name as type
         FROM "treatment" t
         JOIN "treatment_status" ts ON ts.id = t."status_id"
         JOIN "treatment_type" tt ON tt.id = t."treatment_type_id"
         WHERE t."medical_record_id" = $1
         ORDER BY t."createdAt" DESC`,
        [medicalRecordId],
      ),

      this.ds.query(
        `SELECT p.id, p."treatment_id" as "treatmentId", p."date", p.description, p."createdAt"
         FROM "procedure" p
         JOIN "treatment" t ON t.id = p."treatment_id"
         WHERE t."medical_record_id" = $1
         ORDER BY p."date" DESC, p."createdAt" DESC`,
        [medicalRecordId],
      ),

      this.ds.query(
        `SELECT pay.id, pay."procedure_id" as "procedureId", pay."date", pay.amount, pay."createdAt"
         FROM "payment" pay
         JOIN "procedure" p ON p.id = pay."procedure_id"
         JOIN "treatment" t ON t.id = p."treatment_id"
         WHERE t."medical_record_id" = $1
         ORDER BY pay."date" DESC, pay."createdAt" DESC`,
        [medicalRecordId],
      ),
    ]);

    return { patient, medicalRecordId, conditions, treatments, procedures, payments };
  }

  async createHistoryEntry(user: any, dto: { type: 'condition'; name: string }) {
    if (dto.type !== 'condition') {
      throw new BadRequestException('Por ahora solo se admite type="condition"');
    }
    if (!dto.name?.trim()) {
      throw new BadRequestException('name es requerido');
    }

    const patient = await this.findPatientForUserOrNull(user);
    if (!patient) throw new NotFoundException('Paciente no encontrado para este usuario');

    const medicalRecordId = await this.ensureMedicalRecordId(patient);

    const existing = await this.ds.query(
      `SELECT id FROM "condition" WHERE name = $1 LIMIT 1`,
      [dto.name.trim()],
    );

    let conditionId: string;
    if (existing[0]) {
      conditionId = existing[0].id;
    } else {
      const created = await this.ds.query(
        `INSERT INTO "condition"(name) VALUES ($1) RETURNING id`,
        [dto.name.trim()],
      );
      conditionId = created[0].id;
    }

    const link = await this.ds.query(
      `INSERT INTO "medical_record_condition"("medical_record_id", "condition_id")
       VALUES ($1, $2)
       RETURNING id, "medical_record_id" as "medicalRecordId", "condition_id" as "conditionId"`,
      [medicalRecordId, conditionId],
    );

    return link[0];
  }

  async deleteHistoryEntry(user: any, id: string) {
    const patient = await this.findPatientForUserOrNull(user);
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const medicalRecordId = await this.ensureMedicalRecordId(patient);

    const row = await this.ds.query(
      `SELECT id FROM "medical_record_condition"
       WHERE id = $1 AND "medical_record_id" = $2 LIMIT 1`,
      [id, medicalRecordId],
    );

    if (!row[0]) throw new ForbiddenException('No puedes borrar esta entrada');

    await this.ds.query(
      `DELETE FROM "medical_record_condition" WHERE id = $1`,
      [id],
    );

    return;
  }
}
