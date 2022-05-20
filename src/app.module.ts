import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validationSchema } from '@config/validationSchema';
import { FinedustModule } from '@finedust/finedust.module';
import { ForecastModule } from '@forecast/forecast.module';
import { UsersModule } from './users/users.module';
import { BatchModule } from './batch/batch.module';
import { ProduceModule } from './produce/produce.module';
import ormconfig from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRoot(ormconfig),
    FinedustModule,
    ForecastModule,
    UsersModule,
    ProduceModule,
    BatchModule,
  ],
})
export class AppModule {}
