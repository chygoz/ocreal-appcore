import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { configs } from 'src/configs';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: configs.AMAZON_SES_SMTP_ENDPOINT,
        port: 465,
        secure: true,
        auth: {
          user: configs.AMAZON_SES_USERNAME,
          pass: configs.AMAZON_SES_PASSWORD,
        },
      },
      defaults: {
        from: 'ocreal.us@gmail.com',
      },
      template: {
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
