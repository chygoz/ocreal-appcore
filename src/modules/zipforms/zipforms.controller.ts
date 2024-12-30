import { Controller, Post, Body} from '@nestjs/common';
import { ZipformsService } from './zipforms.service';
import { FormAuthDto } from './dto/form.dto';

@Controller('zipforms')
export class ZipformsController {
  constructor(private readonly zipformsService: ZipformsService) {
    
  }
  @Post('authUser')
  async login(@Body() formAuthDto: FormAuthDto) {

    // Call the service to authenticate the user
    const result = await this.zipformsService.authenticateUser(formAuthDto);

    // Return the result from authentication
    return {
      status: 'success',
      data: result,
    };
  }
}
