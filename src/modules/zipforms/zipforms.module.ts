import { Module } from '@nestjs/common';
import { ZipformsService } from './zipforms.service';
import { ZipformsController } from './zipforms.controller';
import { HttpModule, } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule, // Import HttpModule here
  ],
  controllers: [ZipformsController],
  providers: [ZipformsService],
})
export class ZipformsModule {}
