import { AreaService } from '@app/area/area.service';
import { AreaEntity } from '@app/area/entity/area.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsService } from '@ssut/nestjs-sqs';
import { Repository } from 'typeorm';
@Injectable()
export class ProduceService {
  private cachedGrid: Set<string>;
  private produceTimes: number[] = [2, 5, 8, 11, 14, 17, 20, 23];
  constructor(
    private readonly sqsService: SqsService,
    @InjectRepository(AreaEntity) private readonly areaRepository: Repository<AreaEntity>,
  ) {
    this.cachedGrid = new Set<string>();
  }

  @Cron('13 23 * * *', { name: 'sendEvent' })
  handleCron() {
    this.sendEvent();
  }

  private async sendEvent(): Promise<void> {
    const [baseDate, baseTime] = this.getRequestTime();
    if (baseDate.length == 0) return;

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
                baseDate,
                baseTime,
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

  private getRequestTime(): string[] {
    const [year, month, day] = new Date()
      .toLocaleString('en-GB', { hour12: false })
      .split(', ')[0]
      .split('/')
      .reverse();
    const baseDate = year + month + day;
    const baseTime = new Date().getHours();

    if (this.produceTimes.includes(baseTime)) {
      return [baseDate, baseTime + '00'];
    } else {
      return ['', ''];
    }
  }
}
