import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SendEmail } from './interfaces/send-email.interface';
import * as path from 'path';
import { MailDispatcherDto } from './dto/mail.dto';
import { configs } from 'src/configs';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailService: MailerService) {}

  getTemplatePath(templateName: string): string {
    const rootDir = process.cwd();
    return path.join(rootDir, 'public/templates', `${templateName}.hbs`);
  }

  async sendEmail(data: SendEmail) {
    try {
      await this.mailService.sendMail({
        to: data.email,
        from: 'contact@ocreal.online',
        subject: data.subject,
        template: this.getTemplatePath(data.template),
        context: {
          ...data.body,
          year: new Date().getFullYear(),
          companyName: 'Ocreal',
        },
      });
      return true;
    } catch (error) {
      console.log('MAIL ERROR', error);
      return false;
    }
  }

  async emailDispatcher(mailDispatcher: MailDispatcherDto) {
    const mailOptions = {
      to: mailDispatcher.to,
      from: mailDispatcher.from,
      subject: mailDispatcher.subject ?? 'Testing Email',
      text: mailDispatcher.text,
      html: mailDispatcher.html,
      attachments: mailDispatcher.attachments,
    };

    const transporter = nodemailer.createTransport({
      host: configs.EMAIL_HOST,
      port: parseInt(configs.EMAIL_PORT || '465'),
      secure: true, // true for 465, false for other ports.
      auth: {
        user: configs.EMAIL_USERNAME,
        pass: configs.EMAIL_PASSWORD,
      },
    });

    transporter
      .sendMail(mailOptions)
      .then((response: any) => {
        this.logger.log('Email sent successfully');
      })
      .catch((error) => {
        console.log(error);
        this.logger.error('Error sending email:', error);
      });
  }
}
