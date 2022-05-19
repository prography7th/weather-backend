import { UsersService } from '@app/users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as firebase from 'firebase-admin';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(private configService: ConfigService, private usersService: UsersService) {
    const firebaseCredentials = JSON.parse(this.configService.get('FIREBASE_CREDENTIAL_JSON'));
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async requestToFCM(msg?: string, tks?: string[]) {
    // async requestToFCM() {
    this.logger.debug('Called CronJob...');

    const usersToSendAlarm = await this.usersService.getUserToSendAlarm();
    const tokens = usersToSendAlarm.map((item) => item.token);

    if (tokens.length !== 0) {
      return firebase.messaging().sendMulticast({
        notification: { body: '우산' },
        tokens,
      });
    }
  }
}
