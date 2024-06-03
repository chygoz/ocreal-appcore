import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UsersService } from './users.service';
import { EmailModule } from 'src/services/email/email.module';
import { UserDocumentSchema, UserDocument } from './schema/user_documents';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserDocument.name, schema: UserDocumentSchema },
    ]),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
