import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from './property.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';

export type PropertyTourDocument = PropertyTourSchedule & Document;

@Schema({ timestamps: true })
export class PropertyTourSchedule {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  seller: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  sellerAgent?: Agent;

  @Prop({
    type: Date,
    required: true,
  })
  eventDate: Date;

  @Prop({
    type: String,
    required: true,
  })
  startTime: string;

  @Prop({
    type: String,
    required: true,
  })
  endTime: string;

  @Prop({
    type: String,
    required: true,
  })
  timeZone: string;
}

export const PropertyTourScheduleSchema =
  SchemaFactory.createForClass(PropertyTourSchedule);
