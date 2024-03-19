import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationRuleEnum,
} from './schema/notification.schema';
import { PaginationDto } from 'src/constants/pagination.dto';

@Injectable()
export default class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async createUserNotification(data: Partial<Notification>) {
    const notification = await this.notificationModel.create({
      ...data,
      refPath: NotificationRuleEnum.User,
    });
    await notification.save();
    return notification;
  }

  async createAgentNotification(data: Partial<Notification>) {
    const notification = await this.notificationModel.create({
      ...data,
      refPath: NotificationRuleEnum.Agent,
    });
    await notification.save();
    return notification;
  }

  async getUserNotifications(id: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [result, total] = await Promise.all([
      this.notificationModel
        .find({ user: new Types.ObjectId(id) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ user: new Types.ObjectId(id) }),
    ]);
    return { result, total, page, limit };
  }

  async markOneAsRead(id: string) {
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      {
        read: true,
      },
      {
        new: true,
      },
    );
    return notification;
  }

  async markAllAsRead(id: string) {
    const notifications = await this.notificationModel.updateMany(
      {
        user: new Types.ObjectId(id),
      },
      {
        read: true,
      },
    );
    return notifications;
  }
}
