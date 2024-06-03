// src/schemas/property-document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from '../../property/schema/property.schema';
import { Agent } from 'src/modules/agent/schema/agent.schema';

@Schema()
export class PropertyDocumentRepo extends Document {
  @Prop({ type: SchemaTypes.ObjectId, refPath: 'userOrAgentModel' })
  userOrAgent: User | Agent;

  @Prop({ type: SchemaTypes.String, required: true, enum: ['User', 'Agent'] })
  userOrAgentModel: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({
    type: SchemaTypes.String,
  })
  name: string;

  @Prop({
    type: SchemaTypes.String,
  })
  url: string;

  @Prop({
    type: SchemaTypes.String,
  })
  thumbNail: string;

  @Prop({
    type: SchemaTypes.String,
  })
  documentType: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PropertyDocumentRepoSchema =
  SchemaFactory.createForClass(PropertyDocumentRepo);
