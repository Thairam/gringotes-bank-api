import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Account } from './src/accounts/account.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Account],
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false,
});