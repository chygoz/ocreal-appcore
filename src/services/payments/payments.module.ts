import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/users/schema/user.schema';
import { Payment, PaymentSchema } from './schema/payment.shcema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
