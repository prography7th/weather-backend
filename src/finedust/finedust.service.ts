import { Injectable } from '@nestjs/common';
import { FinedustHelper } from '@finedust/finedust.helper';
import { IFinedust, IFinedustSummary } from '@finedust/finedust.interface';

@Injectable()
export class FinedustService {
  regions = require('../lib/finedust/src/regionBase') as string[];
  constructor(private readonly fineDustHelper: FinedustHelper) {}

  public async getInformation(regionName: string): Promise<IFinedustSummary> {
    if (!this.regions.includes(regionName)) {
      throw new Error('잘못된 region을 입력했습니다.');
    } else {
      try {
        let results = await this.getRegionBaseInformation(regionName);
        const summary = {
          sidoName: results.sidoName,
        } as IFinedustSummary;
        summary.pm10 =
          results.pm10avrg >= 0 && results.pm10avrg <= 30
            ? '좋음'
            : results.pm10avrg <= 80
            ? '보통'
            : results.pm10avrg <= 150
            ? '나쁨'
            : '매우나쁨';

        summary.pm25 =
          results.pm25avrg >= 0 && results.pm25avrg <= 15
            ? '좋음'
            : results.pm25avrg <= 35
            ? '보통'
            : results.pm25avrg <= 75
            ? '나쁨'
            : '매우나쁨';
        return summary;
      } catch (err) {
        throw new Error(err);
      }
    }
  }

  private async getRegionBaseInformation(regionName: string): Promise<IFinedust> {
    const results = await this.fineDustHelper.getFinedustInformation();
    return results.filter((information: IFinedust) => information.sidoName === regionName)[0];
  }
}
