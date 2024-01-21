// import {
//   Body,
//   Controller,
//   Get,
//   Post,
//   Put,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/auth-jwt.guard';
// import { MedRepAuthGuard } from '../auth/guards/med-rep.guard';
// import NotificationService from './notitifcation.service';

// @UseGuards(JwtAuthGuard)
// @Controller('Notifications')
// export class NotificationController {
//   constructor(private readonly notificationService: NotificationService) {}

//   @Get()
//   getUserNotifications(@Req() req: any) {
//     return this.notificationService.getUserNotifications({
//       userId: req.user.id,
//     });
//   }

//   @Put('read/one/:id')
//   markOneAsRead(@Req() req: any) {
//     return this.notificationService.markOneAsRead(req.params.id);
//   }

//   @Put('read/all/')
//   markAllAsRead(@Req() req: any) {
//     return this.notificationService.markAllAsRead(req.user.id);
//   }

//   // @Get(':id/cycle')
//   // getCycleNotification(@Req() req: any) {
//   //   return this.notificationService.getCycleNotification({
//   //     NotificationId: req.params.id,
//   //   });
//   // }
// }
