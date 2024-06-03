import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from './property.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';

export type PropertyTourDocument = PropertyTour & Document;

@Schema({ timestamps: true })
export class PropertyTour {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  buyer: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  seller: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  sellerAgent?: Agent;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  fullName?: string;

  @Prop({ eventDate: Date, tourTime: SchemaTypes.String })
  eventDate: Array<{
    eventDate: Date;
    tourTime: string;
  }>;

  @Prop({ type: String })
  phoneNumber?: string;
}

export const PropertyTourSchema = SchemaFactory.createForClass(PropertyTour);
