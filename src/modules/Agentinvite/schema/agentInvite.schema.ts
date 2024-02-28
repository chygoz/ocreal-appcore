// Agent.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, SchemaTypes } from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Property } from 'src/modules/property/schema/property.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';
// import * as moment from 'moment';

export type AgentDocument = HydratedDocument<AgentInvite>;

export enum AgentIviteStatus {
  accepted = 'accepted',
  rejected = 'rejected',
  pending = 'pending',
}

@Schema({ timestamps: true })
export class AgentInvite extends Document {
  @Prop({ unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({
    type: { type: SchemaTypes.ObjectId, ref: 'User' },
  })
  invitedBy?: User;

  @Prop({
    type: { type: SchemaTypes.ObjectId, ref: 'Property' },
  })
  property: Property;

  @Prop({
    type: { type: SchemaTypes.ObjectId, ref: 'Agent' },
  })
  agent: Agent;

  @Prop({
    status: {
      type: SchemaTypes.String,
      enum: Object.values(AgentIviteStatus),
      default: AgentIviteStatus.pending,
    },
  })
  status: AgentIviteStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AgentInviteSchema = SchemaFactory.createForClass(AgentInvite);
