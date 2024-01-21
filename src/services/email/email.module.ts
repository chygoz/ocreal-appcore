import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { configs } from 'src/configs';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: configs.MAILER_HOST,
        // port: Number(configs.MAILER_PORT),
        // secure: false,
        service: 'gmail',
        auth: {
          user: configs.MAILER_USERNAME,
          pass: configs.MAILER_PASSWORD,
        },
      },
      defaults: {
        from: '"Pharmaserv Help Desk" <helpdesk@pharmaserv.ng>',
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
