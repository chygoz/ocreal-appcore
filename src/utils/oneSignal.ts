import { Injectable } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';

@Injectable()
export class OneSignalService {
  private client: OneSignal.DefaultApi;

  constructor() {
    // Create the OneSignal configuration
    const configuration = OneSignal.createConfiguration({
      //userKey: process.env.ONESIGNAL_USER_KEY as string, // User Authentication Key
      // appKey: process.env.ONESIGNAL_APP_KEY, // App Authentication Key
    });

    // Initialize the OneSignal client
    this.client = new OneSignal.DefaultApi(configuration);
  }

  /**
   * Send a notification to target devices
   * @param title - Title of the notification
   * @param message - Body of the notification
   * @param targetDeviceIds - Array of OneSignal player IDs
   * @param url - (Optional) URL to open when the notification is clicked
   */
  async sendNotification(
    title: string,
    message: string,
    targetDeviceIds: string[],
    url?: string,
  ): Promise<any> {
    try {
      // Create a new notification object
      const notification = new OneSignal.Notification();
      notification.app_id = process.env.ONESIGNAL_APP_ID; // Set your app ID
      notification.contents = { en: message }; // Message content
      notification.headings = { en: title }; // Notification title
      // notification.include_player_ids = targetDeviceIds; // Target player IDs

      // Optionally include a URL to open
      if (url) {
        notification.url = url;
      }

      // Send the notification using OneSignal client
      const response = await this.client.createNotification(notification);
      console.log('Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error(
        'Failed to send notification:',
        error.response?.data || error.message,
      );
      throw new Error('Error sending notification via OneSignal');
    }
  }
}
