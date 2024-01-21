// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Notification } from '../notification/schema/notification.schema';

// @Injectable()
// export class NotificationRepository {
//   constructor(
//     @InjectModel(Notification.name)
//     private readonly notificationModel: Model<Notification>,
//     // private readonly userRepo: UserRepository,
//   ) {}

//   async createNotification(data: {
//     salesRepData: Partial<Notification>;
//     managerNotificationPayload?: Partial<Notification>;
//   }): Promise<Notification> {
//     const notification = await this.notificationModel.create(data.salesRepData);
//     await notification.save();
//     // if (data.managerNotificationPayload) {
//     //   const manager = await this.userRepo.getUserManager(
//     //     data.salesRepData.userId,
//     //   );
//     //   await this.notificationModel.create({
//     //     ...data.managerNotificationPayload,
//     //     user: manager,
//     //     userId: manager.id,
//     //   });
//     // }
//     return notification;
//   }

//   async markOneAsRead(id: string) {
//     await this.findByIdOrReject(id);
//     return await this.notificationModel.findByIdAndUpdate(
//       id,
//       {
//         read: true,
//       },
//       { new: true },
//     );
//   }

//   async markAllAsRead(userId: string) {
//     await this.notificationModel.updateMany(
//       { userId: userId },
//       {
//         read: true,
//       },
//       {
//         new: true,
//       },
//     );
//     return;
//   }

//   async findByIdOrReject(id: string) {
//     const notification = await this.notificationModel.findById(id);
//     if (!notification) throw new NotFoundException('Notification not found!');
//     return notification;
//   }

//   async findNotifications(query: any) {
//     return await this.notificationModel.find(query).sort({ createdAt: -1 });
//   }
// }
