import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST, //'localhost', //'database',
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    retryDelay: 10000,
    entities: [
        __dirname + '/../**/*.entity{.ts,.js}',
    ],
    synchronize: true, // set to false for typeorm to not create tables automatically
  }