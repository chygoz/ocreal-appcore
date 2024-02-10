// webhook.controller.ts

import { Controller, Post, Req, Res } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Request } from 'express';

@Controller('webhook')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  async handleWebhook(@Req() req, @Res() res) {
    const sig = req.headers['stripe-signature'];
    try {
      // const payload = req.raw;

      // Convert payload to buffer
      // const bufferPayload = Buffer.from(payload);

      await this.webhooksService.handleStripeEvent(sig, req.body.id);
    } catch (err) {
      console.error('Error verifying webhook signature:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    res.status(200).json({ received: true });
  }

  private async getRawBody(req: Request): Promise<Buffer> {
    try {
      const rawBody = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
          data += chunk;
        });
        req.on('end', () => {
          resolve(data);
        });
        req.on('error', (err) => {
          reject(err);
        });
      });

      return Buffer.from(rawBody, 'utf-8');
    } catch (error) {
      throw new Error(`Error retrieving raw request body: ${error.message}`);
    }
  }
}
