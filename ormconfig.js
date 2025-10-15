/**
 * Configuración de TypeORM para migraciones y seeds
 * Este archivo es utilizado por la CLI de TypeORM
 */
const { DataSource } = require('typeorm');
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'astri',
    database: process.env.DB_DATABASE || 'hidoc-db',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    synchronize: false, // Importante: false para producción
});
module.exports = dataSource;
export default dataSource;