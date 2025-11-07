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
  specialty?: string;     // ← opcional
}


// Normalizador definitivo: convierte lo que venga a enum de BD
function normalizeDbRole(input?: string | null): DbRole {
  const up = String(input ?? '').toUpperCase();
  if (up === 'DOCTOR') return 'doctor';
  if (up === 'PATIENT' || up === 'PACIENTE') return 'paciente';
  if (up === 'ADMIN') return 'admin';
  return 'paciente';
}


@Injectable()
export class UsersService {
  constructor(private readonly ds: DataSource) {}

  // =========================
  // Métodos requeridos por Auth
  // =========================

  /** Busca usuario por email (incluye password para validar login) */
  async findByEmail(email: string) {
    const rows = await this.ds.query(
      `SELECT id, email, name, role, password, "createdAt"
         FROM "user" WHERE email = $1 LIMIT 1`,
      [email],
    );
    return rows[0] || null;
  }

  async findOne(id: string) {
    const rows = await this.ds.query(
      `SELECT id, email, name, role, "createdAt"
         FROM "user" WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  /**
   * Crea el usuario y, según el rol, crea fila en patient o doctor_profile (transacción).
   */
  // Dentro de UsersService
async create(data: Partial<CreateUserInput>) {
  // Validaciones mínimas
  if (!data?.email || !data?.password || !data?.name) {
    throw new BadRequestException('Faltan campos para crear usuario');
  }

  // ¿ya existe el email?
  const existing = await this.findByEmail(data.email);
  if (existing) {
    throw new ConflictException('El email ya está registrado');
  }

  // Hash de contraseña (si no viene ya hasheada)
  const isBcrypt =
    typeof data.password === 'string' && data.password.startsWith('$2b$');
  const passwordHash = isBcrypt
    ? String(data.password)
    : await bcrypt.hash(String(data.password), 12);

  // Normaliza el rol a enum de BD
  const role: DbRole = normalizeDbRole(String(data.role ?? ''));

  // Transacción: crea usuario y su perfil por rol
  return await this.ds.transaction(async (trx) => {
    // 1) Insert en tabla "user"
    const userRes = await trx.query(
      `INSERT INTO "user"(email, name, role, password)
       VALUES ($1, $2, $3::user_role_enum, $4)
       RETURNING id, email, name, role, "createdAt"`,
      [data.email, data.name, role, passwordHash],
    );
    const user = userRes[0];

    // 2) Según rol, crea registro en patient o doctor_profile
    if (role === 'paciente') {
      await trx.query(
        `INSERT INTO "patient"("userId", name, email)
         VALUES ($1, $2, $3)`,
        [user.id, user.name, user.email],
      );
    } else if (role === 'doctor') {
  const professionalId = data.professionalId ?? null;

  // Defaults seguros si no llegan en el registro
  const specialty = (data as any).specialty ?? 'General';
  const price = 0;           // entero
  const rating = 0;          // numeric(3,2)
  const about = null;        // text
  const isOnline = false;    // boolean

  await trx.query(
        `INSERT INTO "doctor_profile"
          ("user_id", "fullName", "specialty", "price", "rating", "about", "isOnline", "professionalId")
        VALUES ($1,       $2,        $3,         $4,     $5,       $6,      $7,         $8)`,
        [ user.id, user.name, specialty, price, rating, about, isOnline, professionalId ],
      );
    }
    // (role === 'admin') -> sin perfil adicional por ahora

    return user; // devuelve el usuario (sin password)
  });
}

  // =========================
  // PERFIL (me)
  // =========================

  async getMe(userId: string) {
    const user = await this.ds.query(
      `SELECT id, email, name, role, "createdAt" FROM "user" WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (!user[0]) throw new NotFoundException('Usuario no encontrado');
    return user[0];
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
      // valida colisión de email
      const exists = await this.findByEmail(dto.email);
      if (exists && exists.id !== userId) {
        throw new ConflictException('El email ya está en uso');
      }
      sets.push(`email = $${i++}`);
      params.push(dto.email);
    }

    params.push(userId);
    const sql = `UPDATE "user" SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, email, name, role, "createdAt"`;
    const updated = await this.ds.query(sql, params);
    return updated[0];
  }

  // =========================
  // HISTORIAL (me/history)
  // =========================

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
        `SELECT mrc.id,
                c.id as "conditionId",
                c.name
           FROM "medical_record_condition" mrc
           JOIN "condition" c ON c.id = mrc."condition_id"
          WHERE mrc."medical_record_id" = $1
          ORDER BY c.name ASC`,
        [medicalRecordId],
      ),

      this.ds.query(
        `SELECT t.id,
                t."totalPrice",
                t."startDate",
                ts.name as status,
                tt.name as type
           FROM "treatment" t
           JOIN "treatment_status" ts ON ts.id = t."status_id"
           JOIN "treatment_type"   tt ON tt.id = t."treatment_type_id"
          WHERE t."medical_record_id" = $1
          ORDER BY t."createdAt" DESC`,
        [medicalRecordId],
      ),

      this.ds.query(
        `SELECT p.id,
                p."treatment_id" as "treatmentId",
                p."date",
                p.description,
                p."createdAt"
           FROM "procedure" p
           JOIN "treatment" t ON t.id = p."treatment_id"
          WHERE t."medical_record_id" = $1
          ORDER BY p."date" DESC, p."createdAt" DESC`,
        [medicalRecordId],
      ),

      this.ds.query(
        `SELECT pay.id,
                pay."procedure_id" as "procedureId",
                pay."date",
                pay.amount,
                pay."createdAt"
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
    if (!dto.name?.trim()) throw new BadRequestException('name es requerido');

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
        `INSERT INTO "condition"(name)
         VALUES ($1)
         RETURNING id`,
        [dto.name.trim()],
      );
      conditionId = created[0].id;
    }

    const link = await this.ds.query(
      `INSERT INTO "medical_record_condition"("medical_record_id","condition_id")
       VALUES ($1,$2)
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
      `SELECT id
         FROM "medical_record_condition"
        WHERE id = $1
          AND "medical_record_id" = $2
        LIMIT 1`,
      [id, medicalRecordId],
    );

    if (!row[0]) throw new ForbiddenException('No puedes borrar esta entrada');

    await this.ds.query(`DELETE FROM "medical_record_condition" WHERE id = $1`, [id]);
    return;
  }
}