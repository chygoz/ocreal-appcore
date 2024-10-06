import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { FirebaseMessagingService } from './firebase-messaging.service';

@Global()
@Module({
  providers: [FirebaseMessagingService],
  exports: [FirebaseMessagingService],
})
export class FirebaseMessagingModule {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(
      path.resolve(__dirname, '../../../ocreal_firebase_config.json'),
    ); // Path to your file in the root

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}
