import { Injectable , HttpException, HttpStatus} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormAuthDto, FormDto } from './dto/form.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class ZipformsService {
    private readonly zipFormUrl = 'https://api.pre.zipformplus.com/api/auth/user';
    constructor(private readonly httpService: HttpService,     private readonly configService: ConfigService,
    ) {
        
    }
    async authenticateUser(formAuthDto: FormAuthDto): Promise<any> {

        const {UserName, Password} = formAuthDto

        const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY')
        const payload = {
          SharedKey: sharedKey, 
          ...formAuthDto
        };
    
        try {
          const response = await firstValueFrom(this.httpService.post(this.zipFormUrl, payload));
          return response.data; // Return the response data from ZipForm API
        } catch (error) {
          // Handle errors appropriately
          throw new HttpException(
            {
              status: HttpStatus.UNAUTHORIZED,
              error: 'Authentication failed. Please check your credentials.',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

}
