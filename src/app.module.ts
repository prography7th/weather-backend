import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validationSchema } from '@config/validationSchema';
import { FinedustModule } from '@finedust/finedust.module';
import { ForecastModule } from '@forecast/forecast.module';
import { UsersModule } from './users/users.module';
import ormconfig from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    FinedustModule,
    ForecastModule,
    TypeOrmModule.forRoot(ormconfig),
    UsersModule,
  ],
})
export class AppModule {}
