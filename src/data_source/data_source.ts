import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

// Detecta si el archivo actual está compilado (dist) o es TS (src)
const isCompiled = path.extname(__filename) === '.js';

// Directorio raíz del proyecto
const rootPath = isCompiled ? path.resolve(__dirname, '..') : path.resolve(__dirname, '..');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'astri',
  database: process.env.DB_DATABASE || 'hidoc-db',
  entities: [path.join(rootPath, isCompiled ? '**/*.entity.js' : '**/*.entity.ts')],
  migrations: [path.join(rootPath, isCompiled ? 'migrations/*.js' : 'migrations/*.ts')],
  synchronize: false,
  logging: false,
});

export default dataSource;
