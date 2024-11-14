import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Transaction {
  @Prop({ type: String, required: true })
  transactionId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Agent' })
  agentId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Property',
  })
  propertyId: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
