// import { Injectable } from '@nestjs/common';
// import { Twilio } from 'twilio';
// import { EmailService } from '../../services/email/email.service';
// import { EMAIL_TEMPLATES } from '../../constants';
// import { NotificationRepository } from './notification.repository';

// @Injectable()
// export default class NotificationService {
//   private twilioClient: Twilio;
//   constructor(
//     private readonly emailService: EmailService,
//     private readonly notificationRepo: NotificationRepository,
//   ) {}

//   // async sendSms(receiverPhoneNumber: string, message: string) {
//   //   const senderPhoneNumber = configs.TWILO_PHONE_NUMBER;
//   //   return this.twilioClient.messages.create({
//   //     body: message,
//   //     from: senderPhoneNumber,
//   //     to: receiverPhoneNumber,
//   //   });
//   // }

//   // async sendNewManagerEmail({ email, body }) {
//   //   const result = await this.emailService.sendEmail({
//   //     email,
//   //     subject: 'Welcome to Pharmaserv',
//   //     template: EMAIL_TEMPLATES.NEW_MANAGER_EMAIL,
//   //     body: body,
//   //   });

//   //   return result;
//   // }

//   // async sendNewMedRepEmail({ email, body }) {
//   //   const result = await this.emailService.sendEmail({
//   //     email,
//   //     subject: 'Welcome to Pharmaserv',
//   //     template: EMAIL_TEMPLATES.NEW_MEDREP_EMAIL,
//   //     body: body,
//   //   });

//   //   return result;
//   // }

//   // async sendForgotPasswordEmail({ email, body }) {
//   //   const result = await this.emailService.sendEmail({
//   //     email,
//   //     subject: 'Email verification',
//   //     template: EMAIL_TEMPLATES.FORGOT_PASSWORD,
//   //     body: body,
//   //   });

//   //   return result;
//   // }

//   // async passwordResetEmail({ email, body }) {
//   //   const result = await this.emailService.sendEmail({
//   //     email,
//   //     subject: 'Password update successful',
//   //     template: EMAIL_TEMPLATES.PASSWORD_UPDATE,
//   //     body: body,
//   //   });

//   //   return result;
//   // }

//   async getUserNotifications(query: any) {
//     const notifications = await this.notificationRepo.findNotifications(query);
//     return {
//       status: true,
//       message: 'Notifications found.',
//       data: {
//         notifications,
//       },
//     };
//   }

//   async markOneAsRead(id: string) {
//     const notifications = await this.notificationRepo.markOneAsRead(id);
//     return {
//       status: true,
//       message: 'Notifications read.',
//       data: {
//         notifications,
//       },
//     };
//   }

//   async markAllAsRead(id: string) {
//     const notifications = await this.notificationRepo.markAllAsRead(
//       id.toString(),
//     );
//     return {
//       status: true,
//       message: 'Notifications read.',
//       data: {
//         notifications,
//       },
//     };
//   }
// }
