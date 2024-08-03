import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmailService } from 'src/services/email/email.service';
import {
  Notification,
  NotificationUserType,
} from './schema/notification.schema';
import { PaginationDto } from 'src/constants/pagination.dto';

@Injectable()
export default class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async createNotification(data: {
    title: string;
    body: string;
    user: string;
    userType?: NotificationUserType;
  }): Promise<Notification> {
    const saved = await this.notificationModel.create(data);
    const notification = await saved.save();
    //TODO: Send push notifications here
    return notification;
  }

  async createMultipleNotifications(data: {
    title: string;
    body: string;
    user: string[];
    userType?: NotificationUserType;
  }) {
    await this.notificationModel.insertMany(data);
    // const notification = await saved.save();
    // return notification;
  }

  // async sendSms(receiverPhoneNumber: string, message: string) {
  //   const senderPhoneNumber = configs.TWILO_PHONE_NUMBER;
  //   return this.twilioClient.messages.create({
  //     body: message,
  //     from: senderPhoneNumber,
  //     to: receiverPhoneNumber,
  //   });
  // }

  // async sendNewManagerEmail({ email, body }) {
  //   const result = await this.emailService.sendEmail({
  //     email,
  //     subject: 'Welcome to Pharmaserv',
  //     template: EMAIL_TEMPLATES.NEW_MANAGER_EMAIL,
  //     body: body,
  //   });

  //   return result;
  // }

  // async sendNewMedRepEmail({ email, body }) {
  //   const result = await this.emailService.sendEmail({
  //     email,
  //     subject: 'Welcome to Pharmaserv',
  //     template: EMAIL_TEMPLATES.NEW_MEDREP_EMAIL,
  //     body: body,
  //   });

  //   return result;
  // }

  // async sendForgotPasswordEmail({ email, body }) {
  //   const result = await this.emailService.sendEmail({
  //     email,
  //     subject: 'Email verification',
  //     template: EMAIL_TEMPLATES.FORGOT_PASSWORD,
  //     body: body,
  //   });

  //   return result;
  // }

  // async passwordResetEmail({ email, body }) {
  //   const result = await this.emailService.sendEmail({
  //     email,
  //     subject: 'Password update successful',
  //     template: EMAIL_TEMPLATES.PASSWORD_UPDATE,
  //     body: body,
  //   });

  //   return result;
  // }

  async getAccountNotifications(paginationDto: PaginationDto, id: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [result, total] = await Promise.all([
      this.notificationModel
        .find({ user: new Types.ObjectId(id) })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.notificationModel.countDocuments({ user: new Types.ObjectId(id) }),
    ]);

    return { result, total, page, limit };
  }

  async markOneAsRead(id: string) {
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        id,
        {
          read: true,
        },
        {
          new: true,
        },
      )
      .populate('user');
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    return notification;
  }

  async markAllAsRead(id: string) {
    await this.notificationModel.updateMany(
      {
        user: new Types.ObjectId(id),
      },
      {
        read: true,
      },
    );
    return true;
  }
}
