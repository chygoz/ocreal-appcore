import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseMessagingService {
  private messaging: admin.messaging.Messaging;

  constructor() {
    this.messaging = admin.messaging();
  }

  async sendNotificationToDevice(
    token: string,
    payload: admin.messaging.MessagingPayload,
  ): Promise<string> {
    try {
      const response = await this.messaging.sendToDevice(token, payload);
      return `Message sent successfully: ${response}`;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  async sendNotificationToTopic(
    topic: string,
    payload: admin.messaging.MessagingPayload,
  ): Promise<string> {
    try {
      const response = await this.messaging.sendToTopic(topic, payload);
      return `Message sent to topic successfully: ${response}`;
    } catch (error) {
      throw new Error(`Error sending message to topic: ${error.message}`);
    }
  }
}
