import { AreaEntity } from '../../area/entity/area.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as xlsx from 'xlsx';

export default class SeedArea implements Seeder {
  private createAreas(): AreaEntity[] {
    return xlsx.utils.sheet_to_json(xlsx.readFile('area.csv').Sheets.Sheet1);
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection.createQueryBuilder().insert().into(AreaEntity).values(this.createAreas()).execute();
  }
}
