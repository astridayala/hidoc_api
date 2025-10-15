/**
 * Configuración de TypeORM para migraciones usando archivos TS
 * Este archivo es utilizado por la CLI de TypeORM para desarrollo
 */
const { DataSource } = require('typeorm');
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'astri',
    database: process.env.DB_DATABASE || 'hidoc-db',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
});
module.exports = dataSource;