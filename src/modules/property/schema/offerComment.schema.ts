import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { Offer } from './offer.schema';

@Schema({ timestamps: true, versionKey: false })
export class OfferComment extends Document {
  @Prop({
    type: SchemaTypes.Mixed,
  })
  comment: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Offer' })
  offer: Offer;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  agent: Agent;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OfferCommentSchema = SchemaFactory.createForClass(OfferComment);
