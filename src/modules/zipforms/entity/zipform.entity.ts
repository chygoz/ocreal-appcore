import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Zipform extends Document {
  @Prop({ required: false })
  transactionId: string;

  @Prop({ required: false })
  agentId: string;

  @Prop({ required: false })
  formId: string;
}

export const zipformSchema = SchemaFactory.createForClass(Zipform);
