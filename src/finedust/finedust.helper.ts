import { CACHE_MANAGER, Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { IFinedust } from '@finedust/finedust.interface';

export class FinedustHelper implements OnModuleInit, OnModuleDestroy {
  finedustGenerator: () => Promise<IFinedust[]>;
  onModuleInit() {
    this.setFinedustInformation();
  }
  async onModuleDestroy() {
    await this.cacheManager.reset();
  }
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.finedustGenerator = require('../lib/finedust/index');
  }

  @Cron('0 0 * * *', { name: 'setFineDustInformation' })
  handleCron() {
    this.setFinedustInformation();
  }

  public async getFinedustInformation(): Promise<IFinedust[]> {
    return await this.cacheManager.get('finedust');
  }

  private async setFinedustInformation(): Promise<void> {
    let results: IFinedust[] | null;
    try {
      results = await this.finedustGenerator();
    } catch (err) {
      throw new Error(err);
    }
    if (results) {
      await this.cacheManager.set('finedust', results);
    }
  }
}
