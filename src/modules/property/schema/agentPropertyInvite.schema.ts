import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from './property.schema';
import { AccountTypeEnum } from 'src/constants';

export interface Price {
  amount: number;
  currency: string;
}

export enum AgentPropertyInviteStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

@Schema({ timestamps: true, versionKey: false })
export class AgentPropertyInvite extends Document {
  @Prop([
    {
      status: {
        type: SchemaTypes.String,
        enum: Object.values(AgentPropertyInviteStatusEnum),
      },
      eventTime: SchemaTypes.Date,
    },
  ])
  status: {
    status: AgentPropertyInviteStatusEnum;
    eventTime: Date;
  }[];

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(AgentPropertyInviteStatusEnum),
    default: AgentPropertyInviteStatusEnum.pending,
  })
  currentStatus: AgentPropertyInviteStatusEnum;

  @Prop({
    type: SchemaTypes.String,
    enum: Object.values(AccountTypeEnum),
  })
  inviteAccountType: AccountTypeEnum;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  invitedBy: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  agent: Agent;
}

export const AgentPropertyInviteSchema =
  SchemaFactory.createForClass(AgentPropertyInvite);
