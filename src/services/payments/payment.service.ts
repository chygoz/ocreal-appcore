import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/schema/user.schema';
// import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    // private readonly emailService: EmailService,
  ) {}
}
