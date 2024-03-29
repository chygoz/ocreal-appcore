import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendEmail } from './interfaces/send-email.interface';
import * as path from 'path';
@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  getTemplatePath(templateName: string): string {
    const rootDir = process.cwd();
    return path.join(rootDir, 'public/templates', `${templateName}.hbs`);
  }

  async sendEmail(data: SendEmail) {
    try {
      await this.mailService.sendMail({
        to: data.email,
        from: 'no-reply@ocreal.io',
        subject: data.subject,
        template: this.getTemplatePath(data.template),
        context: data.body,
      });
      return true;
    } catch (error) {
      console.log('MAIL ERROR', error);
      return false;
    }
  }
}
