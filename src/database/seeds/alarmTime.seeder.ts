import { AlarmTimeEntity } from '../../users/entity/alarmTime.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

interface AlarmTime {
  id: number;
  time: number;
}

export default class CreateAlarmTimes implements Seeder {
  private createAlarmTimes(): AlarmTime[] {
    const alarmTimes = [];
    for (let time = 0; time < 24; time++) {
      alarmTimes.push({ id: time, time });
    }

    return alarmTimes;
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.createQueryBuilder().insert().into(AlarmTimeEntity).values(this.createAlarmTimes()).execute();
  }
}
