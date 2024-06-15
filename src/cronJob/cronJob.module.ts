import { Module } from '@nestjs/common';
import { CronJobService } from './cronJob.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Property,
  PropertySchema,
} from 'src/modules/property/schema/property.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  providers: [CronJobService],
})
export class CronJobModule {}
