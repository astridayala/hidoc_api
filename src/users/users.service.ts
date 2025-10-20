import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Si tienes un enum/Type para rol, puedes importarlo aquí.
// De lo contrario, dejamos string.
type UserRole = 'doctor' | 'paciente' | 'admin';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;     // en texto plano: aquí se hace el hash
  role?: UserRole;      // por defecto 'doctor'
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
       FROM "user"
       WHERE email = $1
       LIMIT 1`,
      [email],
    );
    return rows[0] || null;
  }

  /** Busca usuario por id (útil para JwtStrategy.validate) */
  async findOne(id: string) {
    const rows = await this.ds.query(
      `SELECT id, email, name, role, "createdAt"
       FROM "user"
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  /**
   * Crea un usuario (hace hash del password).
   * Devuelve el usuario sin el campo password.
   */
  async create(data: Partial<CreateUserInput>) {
    if (!data?.email || !data?.password || !data?.name) {
      throw new BadRequestException('Faltan campos para crear usuario');
    }

    // ¿ya existe el email?
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(String(data.password), 10);
    const role: UserRole = (data.role as UserRole) ?? 'doctor';

    const inserted = await this.ds.query(
      `INSERT INTO "user"(email, name, role, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, "createdAt"`,
      [data.email, data.name, role, hash],
    );

    return inserted[0];
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

  /**
   * Obtiene el patient actual vinculado al usuario.
   * Heurística: buscar patient por email = user.email.
   */
  private async findPatientForUserOrNull(user: any) {
    const patient = await this.ds.query(
      `SELECT *
         FROM "patient"
        WHERE email = $1
        LIMIT 1`,
      [user.email],
    );
    return patient[0] || null;
  }

  private async ensureMedicalRecordId(patient: any) {
    // La columna en DB es "medicalRecordId" (camelCase con comillas).
    const hasMR =
      patient.medicalRecordId ??
      patient.medicalrecordid ?? // por si el driver lo trae en minúsculas
      null;

    if (!hasMR) {
      const rec = await this.ds.query(
        `INSERT INTO "medical_record" DEFAULT VALUES RETURNING id, "createdAt"`,
      );
      const recordId = rec[0].id;

      await this.ds.query(
        `UPDATE "patient" SET "medicalRecordId" = $1 WHERE id = $2`,
        [recordId, patient.id],
      );

      patient.medicalRecordId = recordId;
      return recordId;
    }

    return hasMR;
  }

  async getMyHistory(user: any) {
    const patient = await this.findPatientForUserOrNull(user);
    if (!patient) {
      // No hay perfil de paciente aún
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

    // 1) Crear/recuperar condition
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

    // 2) Vincular al medical_record
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

    // Aseguramos pertenencia
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