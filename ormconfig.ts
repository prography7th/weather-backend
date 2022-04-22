import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './src/users/entity/user.entity';
import { AlarmTimeEntity } from './src/users/entity/alarmTime.entity';

dotenv.config();

const ormconfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [UserEntity, AlarmTimeEntity],
  synchronize: JSON.parse(process.env.DB_SYNC),
  //   migrations: [__dirname + '/src/migrations/*.ts'],
  //   cli: { migrationsDir: '/src/migrations' },
};

export default ormconfig;
