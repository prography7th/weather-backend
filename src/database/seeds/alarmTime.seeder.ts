import { AlarmTimeEntity } from '../../users/entity/alarmTime.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class AlarmTimeSeeder implements Seeder {
  private createAlarmTimes(): AlarmTimeEntity[] {
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
