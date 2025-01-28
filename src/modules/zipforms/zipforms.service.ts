import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormAuthDto, FormDto } from './dto/form.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZipformsService {
  private readonly zipFormAuthUrl =
    'https://api.pre.zipformplus.com/api/auth/user';
  private readonly zipFormTransactionUrl =
    'https://api.pre.zipformplus.com/api/transactions'; // Replace with the correct endpoint
  private readonly zipFormLibraryUrl =
    'https://api.pre.zipformplus.com/api/transactions'; // Replace with the correct endpoint

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  async authenticateUser(formAuthDto: FormAuthDto): Promise<any> {
    const { UserName, Password } = formAuthDto;

    const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');
    const payload = {
      SharedKey: sharedKey,
      ...formAuthDto,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.zipFormAuthUrl, payload),
      );
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
  async createTransaction(
    contextId: string,
    sharedKey: string,
    transactionData: any,
  ): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-ContextId': contextId, // Custom header for the context ID
      'X-Auth-SharedKey': sharedKey, // Custom header for the shared key
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.zipFormTransactionUrl, transactionData, {
          headers,
        }),
      );
      return response.data; // Return the transaction data
    } catch (error) {
      // Handle errors appropriately
      const errorMessage =
        error.response?.data?.error || 'Failed to create transaction.';
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async addTransactionForm(
    contextId: string,
    sharedKey: string,
    transactionData: any,
  ): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-ContextId': contextId, // Custom header for the context ID
      'X-Auth-SharedKey': sharedKey, // Custom header for the shared key
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.zipFormTransactionUrl, transactionData, {
          headers,
        }),
      );
      return response.data; // Return the transaction data
    } catch (error) {
      // Handle errors appropriately
      const errorMessage =
        error.response?.data?.error || 'Failed to create transaction.';
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
