import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import * as pg from 'pg';

dotenv.config();

const appDataSource = new Sequelize({
  dialect: 'postgres',
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  dialectModule: pg,
  dialectOptions: {
    ssl: process.env.DATABASE_ENABLE_SSL === 'true',
  },
});

export default appDataSource;
