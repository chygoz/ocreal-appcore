// import { Module } from '@nestjs/common';
// import NotificationService from './notitifcation.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { NotificationController } from './notification.controller';
// import { NotificationRepository } from './notification.repository';
// import { User, UserSchema } from 'src/users/user.model';
// import { EmailModule } from 'src/email/email.module';

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//     EmailModule,
//     // UserModule,
//   ],
//   providers: [NotificationService, NotificationRepository],
//   controllers: [NotificationController],
//   exports: [NotificationService, NotificationRepository],
// })
// export class NotificationModule {}
