import { DataSource } from 'typeorm';
import { loadEnvFile } from './load-env';

loadEnvFile();

export function createDataSource() {
  return new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || 'leadflow',
    password: process.env.DB_PASSWORD || 'leadflow',
    database: process.env.DB_NAME || 'leadflow',
    synchronize: false,
    multipleStatements: true,
  });
}
