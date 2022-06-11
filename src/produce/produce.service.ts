import { AreaService } from '@app/area/area.service';
import { AreaEntity } from '@app/area/entity/area.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsService } from '@ssut/nestjs-sqs';
import { Repository } from 'typeorm';
@Injectable()
export class ProduceService {
  constructor(
    private readonly sqsService: SqsService,
    @InjectRepository(AreaEntity) private readonly areaRepository: Repository<AreaEntity>,
    private readonly areaService: AreaService,
    private cachedGrid: Set<string>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11PM, { name: 'sendEvent' })
  handleCron() {
    this.sendEvent();
  }

  private async sendEvent() {
    Logger.log('Redis 캐싱 이벤트 생성 중입니다.', 'REDIS-SQS');
    const areas = await this.getAreaInformations();
    areas.forEach(async (area) => {
      const { x, y } = area;
      const grid = `${String(x).padStart(3, '0')}${String(y).padStart(3, '0')}`;
      if (!this.cachedGrid.has(grid)) {
        this.cachedGrid.add(grid);
        try {
          await this.sqsService.send('area', {
            id: grid,
            deduplicationId: grid,
            groupId: 'cachingGroup',
            delaySeconds: 0,
            body: {
              test: process.env.NODE_ENV === 'development' ? true : false,
              data: {
                ...area,
              },
            },
          });
        } catch (err) {}
      }
    });
    this.cachedGrid.clear();
  }

  private async getAreaInformations() {
    const areas = (await this.areaRepository.find()).map((area: AreaEntity) => {
      return {
        code: area.code,
        x: area.x,
        y: area.y,
      };
    });
    return areas;
  }
}
