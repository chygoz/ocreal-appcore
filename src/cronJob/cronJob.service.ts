import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  Property,
  PropertyStatusEnum,
} from 'src/modules/property/schema/property.schema';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<Property>,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handlePropertyOwnerShipUpdate() {
    await this.propertyModel.updateMany(
      {
        'propertyOwnershipDetails.actionTime': {
          $lte: new Date(),
        },
        currentStatus: PropertyStatusEnum.pendingVerification,
      },
      {
        currentStatus: PropertyStatusEnum.properyOwnershipVerified,
        $push: {
          status: {
            status: PropertyStatusEnum.properyOwnershipVerified,
            eventTime: new Date(),
          },
        },
      },
    );
    this.logger.debug('handlePropertyOwnerShipUpdate handled');
  }
}
