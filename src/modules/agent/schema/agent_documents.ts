// src/schemas/property-document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Agent } from './agent.schema';

@Schema()
export class AgentDocument extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Agent' })
  agent: Agent;

  @Prop([
    {
      name: SchemaTypes.String,
      url: SchemaTypes.String,
      thumbNail: SchemaTypes.String,
      documentType: SchemaTypes.String,
      expirydate: SchemaTypes.Date,
    },
  ])
  documents: Array<{
    name: string;
    url: string;
    thumbNail: string;
    documentType: string;
    expirydate?: Date;
  }>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AgentDocumentSchema = SchemaFactory.createForClass(AgentDocument);
