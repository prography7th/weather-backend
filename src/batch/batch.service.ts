import { UsersService } from '@app/users/users.service';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import * as firebase from 'firebase-admin';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const firebaseCredentials = JSON.parse(this.configService.get('FIREBASE_CREDENTIAL_JSON'));
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async requestToFCM() {
    this.logger.debug('Called CronJob...');

    const usersToSendAlarm: UserForFCM[] = await this.usersService.getUsersToSendAlarm();

    if (usersToSendAlarm.length === 0) {
      return;
    }

    usersToSendAlarm.forEach(async (user) => {
      const now = new Date().toLocaleString('en-GB', { hour12: false }).split(', ');
      const [year, month, day] = now[0].split('/').reverse();

      const baseDate = `${year}${month}${day}`;
      const content: Content[] = await this.cacheManager.get(`${user.grid}:${baseDate}:content`);
      if (!content || content.length === 0) {
        return;
      }

      return firebase
        .messaging()
        .send({
          notification: {
            title: '날씨 알리미 알람',
            body: `${content[0].subMessage}\n${content[0].mainMessage}`,
          },
          token: user.deviceToken,
        })
        .then((res) => {
          console.log('Successfully sent message:', res);
        })
        .catch((err) => {
          console.log('Error sending message:', err);
        });
    });
  }
}
