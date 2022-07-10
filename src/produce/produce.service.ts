import { AreaEntity } from '@app/area/entity/area.entity';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsService } from '@ssut/nestjs-sqs';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
@Injectable()
export class ProduceService {
  private cachedGrid: Set<string>;
  private isBaseContent: string;
  private produceTimes: number[] = [2, 5, 8, 11, 14, 17, 20, 23];
  constructor(
    private readonly sqsService: SqsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(AreaEntity) private readonly areaRepository: Repository<AreaEntity>,
  ) {
    this.cachedGrid = new Set<string>();
  }

  @Cron('13 2,5,8,11,14,17,20,23 * * *', { name: 'sendEvent' })
  handleCron() {
    this.setIsBaseContent();
    this.sendEvent();
  }

  /**
   * @description
   *  produce 하는 메시지가 base content가 될 수 있는지 확인한다.
   *  produce 배치가 돌기전 최초 1회 실행된다.
   *  return  "1(true)" or "0(false)"
   */
  private async setIsBaseContent(): Promise<void> {
    await this.setRotateCountWithOne();
    const now = await this.getRotateCount();
    this.isBaseContent = now === 1 ? '1' : '0';
    this.addRotateCount();
  }

  private async setRotateCountWithOne() {
    const now = await this.getRotateCount();
    if (now == null || now === 4) {
      this.cacheManager.set<number>('rotateCount', 1);
    }
  }

  private async addRotateCount() {
    this.cacheManager.set<number>('rotateCount', (await this.getRotateCount()) + 1, {
      ttl: 60 * 60 * 25,
    });
  }

  private async getRotateCount(): Promise<number> {
    return await this.cacheManager.get<number>('rotateCount');
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
                isBaseContent: this.isBaseContent,
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
