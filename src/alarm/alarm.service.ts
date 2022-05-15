import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';

@Injectable()
export class AlarmService {
  constructor(private configService: ConfigService) {
    const firebaseCredentials = JSON.parse(this.configService.get('FIREBASE_CREDENTIAL_JSON'));
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
    });
  }

  async requestToFCM(message: string, tokens: string[]) {
    return firebase.messaging().sendMulticast({
      data: { body: message },
      tokens,
    });
  }
}
