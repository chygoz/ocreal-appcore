import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormAuthDto, FormDto } from './dto/form.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZipformsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  async authenticateUser(formAuthDto: FormAuthDto): Promise<any> {
    const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');
    const zipFormAuthUrl = this.configService.get<string>('ZIPFORM_AUTH_URL');
    const payload = {
      SharedKey: sharedKey,
      ...formAuthDto,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(zipFormAuthUrl, payload),
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
      const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');
      const zipFormTransactionUrl = this.configService.get<string>(
        'ZIPFORM_TRANSACTION_URL',
      );
      const response = await firstValueFrom(
        this.httpService.post(zipFormTransactionUrl, transactionData, {
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

  async viewAgentLibraryForm(
    contextId: string,
    sharedKey: string,
    // transactionData: any,
  ): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-ContextId': contextId, // Custom header for the context ID
      'X-Auth-SharedKey': sharedKey, // Custom header for the shared key
    };

    try {
      const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');
      const zipFormAgentLibraryUrl = this.configService.get<string>(
        'ZIPFORM_AGENT_LIBRARY_URL',
      );
      const response = await firstValueFrom(
        this.httpService.get(zipFormAgentLibraryUrl, {
          headers,
        }),
      );
      return response.data; // Return the transaction data
    } catch (error) {
      // Handle errors appropriately
      const errorMessage =
        error.response?.data?.error || 'Failed to retrieve form.';
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async viewAllForms(contextId: string, sharedKey: string): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-ContextId': contextId, // Custom header for the context ID
      'X-Auth-SharedKey': sharedKey, // Custom header for the shared key
    };

    try {
      const url = this.configService.get<string>('ZIPFORM_URL');

      const id = '6469ef82-ba25-401d-b745-2daf2d70dcf9';

      const zipFormsUrl = `${url}/libraries/${id}/CAR/1335`; // Replace with the correct endpoint

      const response = await firstValueFrom(
        this.httpService.get(zipFormsUrl, {
          headers,
        }),
      );
      return response.data; // Return the transaction data
    } catch (error) {
      // Handle errors appropriately
      const errorMessage =
        error.response?.data?.error || 'Failed to retrieve all form.';
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
    transactionId: any,
  ): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Auth-ContextId': contextId, // Custom header for the context ID
      'X-Auth-SharedKey': sharedKey, // Custom header for the shared key
    };

    try {
      const url = this.configService.get<string>('ZIPFORM_URL');

      const transactionform = `${url}/transactions/${transactionId}/documents/form`;
      const response = await firstValueFrom(
        this.httpService.post(transactionform, transactionData, {
          headers,
        }),
      );

      console.log(response.data);
      return response.data; // Return the transaction data
    } catch (error) {
      // Handle errors appropriately
      const errorMessage =
        error.response?.data?.error || 'Failed to add form to transaction.';
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
