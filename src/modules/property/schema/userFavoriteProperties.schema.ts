import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
import { Property } from './property.schema';

@Schema({ timestamps: true, versionKey: false })
export class UserSavedProperty extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Property' })
  property: Property;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: User;
}

export const UserSavedPropertySchema =
  SchemaFactory.createForClass(UserSavedProperty);
