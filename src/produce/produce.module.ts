import { Module } from '@nestjs/common';
import { ProduceService } from './produce.service';
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaEntity } from '@app/area/entity/area.entity';
import { AreaModule } from '@app/area/area.module';
const SQS_ENDPOINT = process.env.SQS_ENDPOINT || 'http://localhost:9324';

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY),
  region: 'ap-northeast-2',
});

@Module({
  imports: [
    TypeOrmModule.forFeature([AreaEntity]),
    AreaModule,
    SqsModule.registerAsync({
      useFactory: async () => {
        return {
          producers: [
            {
              sqs,
              queueUrl: `${SQS_ENDPOINT}/area.fifo`,
              name: 'area',
            },
          ],
        };
      },
    }),
  ],
  providers: [ProduceService],
})
export class ProduceModule {}
