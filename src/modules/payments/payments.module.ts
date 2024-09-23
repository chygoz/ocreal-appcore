import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/users/schema/user.schema';
import { Payment, PaymentSchema } from './schema/payment.schema';
import { Invoice, InvoiceSchema } from './schema/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
