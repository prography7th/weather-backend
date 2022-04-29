import { AreaService } from '@app/area/area.service';
import { AreaEntity } from '@app/area/entity/area.entity';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsService } from '@ssut/nestjs-sqs';
import { Repository } from 'typeorm';
@Injectable()
export class ProduceService implements OnModuleInit {
  async onModuleInit() {
    this.sendEvent();
  }

  constructor(
    private readonly sqsService: SqsService,
    @InjectRepository(AreaEntity) private readonly areaRepository: Repository<AreaEntity>,
    private readonly areaService: AreaService,
  ) {}

  public async sendEvent() {
    const areas = await this.getAreaInformations();
    areas.forEach((area) => {
      const id = area.code;
      this.sqsService.send('area', {
        id,
        deduplicationId: id,
        groupId: 'cachingGroup',
        delaySeconds: 0,
        body: {
          test: process.env.NODE_ENV === 'development' ? true : false,
          data: {
            ...area,
          },
        },
      });
    });
  }

  private async getAreaInformations() {
    const areas = (await this.areaRepository.find()).map((area: AreaEntity) => {
      const [lat, lon] = this.areaService.getDdFromDms(
        `${area.latD} ${area.latM} ${area.latS}`,
        `${area.lonD} ${area.lonM} ${area.lonS}`,
      );
      return {
        code: area.code,
        lat,
        lon,
      };
    });
    return areas;
  }
}
