import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from 'src/modules/agent/schema/agent.schema';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from './property.schema';

@Schema({ timestamps: true, versionKey: false })
export class AgentContract extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent', required: true })
  agent: Agent;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property', required: true })
  property: Property;

  @Prop({
    type: [
      {
        name: String,
        url: String,
        dateAdded: { type: Date, default: new Date() },
      },
    ],
  })
  documents: Array<{
    name: string;
    url: string;
    dateAdded: Date;
  }>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AgentContractSchema = SchemaFactory.createForClass(AgentContract);
