import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionDto } from '../dto/zipform.dtos';
import axios from 'axios';
import { Transaction } from '../schema/transaction.schema';

@Injectable()
export class ZipFormService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async authenticateUser() {
    try {
      // Retrieve environment variables using ConfigService
      const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');
      const userName = this.configService.get<string>('ZIPFORM_USERNAME');
      const password = this.configService.get<string>('ZIPFORM_PASSWORD');

      // Check that necessary environment variables are set
      if (!sharedKey || !userName || !password) {
        throw new NotFoundException('Missing required environment variables');
      }
      const url = 'https://api.pre.zipformplus.com/api/auth/user';
      const data = {
        SharedKey: sharedKey,
        UserName: userName,
        Password: password,
      };

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      // Assuming the response contains the ContextId
      const contextId = response.data.contextId;

      return contextId;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async createTransaction(
    payload: CreateTransactionDto,
    contextId: string,
    agentId: string,
  ) {
    try {
      const url = `https://api.pre.zipformplus.com/api/transactions`;
      const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');

      console.log('Request URL:', url);
      console.log('Request Payload:', JSON.stringify(payload, null, 2));
      console.log('Headers:', {
        'X-Auth-ContextId': contextId,
        'X-Auth-SharedKey': sharedKey,
        'Content-Type': 'application/json',
      });

      const response = await axios.post(url, payload, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      // Log the result to check if the transaction ID is present
      console.log('Response from ZipForm:', JSON.stringify(result, null, 2));

      const transactionId = result.value.id;

      // Check if the transaction ID is present
      if (!transactionId) {
        throw new NotFoundException(
          'Transaction ID is missing from the response.',
        );
      }

      await this.transactionModel.create({
        transactionId: result.value.id,
        agentId: agentId,
      });

      return result;
    } catch (error) {
      console.error(
        'Error creating transaction:',
        JSON.stringify(error, null, 2),
      );
      throw new BadRequestException(
        `Error creating transaction: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async listAgentTransaction(agentId: string) {
    try {
      const transactions = await this.transactionModel.find({
        agentId: agentId,
      });

      return transactions || null;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getTransaction(transactionId: string, contextId: string): Promise<any> {
    try {
      const baseUrl = 'http://api.pre.zipformplus.com/api/transactions';
      const url = `${baseUrl}/${transactionId}`;
      const sharedKey = this.configService.get<string>('ZIPFORM_SHARED_KEY');

      console.log('Request URL:', url);
      console.log('Headers:', {
        'X-Auth-ContextId': contextId,
        'X-Auth-SharedKey': sharedKey,
        'Content-Type': 'application/json',
      });

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new BadRequestException(
        `Error fetching transaction: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getAgentLibraries(contextId: string): Promise<any> {
    try {
      const baseUrl = 'http://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/agents/libraries`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data.value; // Return the list of libraries
    } catch (error) {
      console.error('Error fetching agent libraries:', error);
      throw new BadRequestException(
        `Error fetching agent libraries: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getLibraryForms(
    libraryId: string,
    libraryName: string,
    version: string,
    contextId: string,
  ): Promise<any> {
    try {
      const baseUrl = 'http://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/libraries/${libraryId}/${libraryName}/${version}`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data.value; // Return the list of forms in the library
    } catch (error) {
      console.error('Error fetching library forms:', error);
      throw new BadRequestException(
        `Error fetching library forms: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async addFormToTransaction(
    transactionId: string,
    formId: string,
    contextId: string,
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/documents/form`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.post(
        url,
        { id: formId },
        {
          headers: {
            'X-Auth-ContextId': contextId,
            'X-Auth-SharedKey': sharedKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error adding form to transaction:', error);
      throw new BadRequestException(
        `Error adding form to transaction: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getDocumentContents(
    transactionId: string,
    documentId: string,
    contextId: string,
    version?: string,
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/documents/${documentId}${version ? `/${version}` : ''}`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching document contents:', error);
      throw new BadRequestException(
        `Error fetching document contents: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getDocumentMetadata(
    transactionId: string,
    documentId: string,
    contextId: string,
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/documents/${documentId}/meta`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      throw new BadRequestException(
        `Error fetching document metadata: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getFormsFromLibrary(
    libraryId: string,
    contextId: string,
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/libraries/${libraryId}/forms`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data.value; // Return the list of forms
    } catch (error) {
      console.error('Error fetching forms from library:', error);
      throw new BadRequestException(
        `Error fetching forms from library: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getFormsByTransitionId(transactionId: string, contextId: string) {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/forms`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;

      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data.value;
    } catch (error) {
      throw new BadRequestException(
        `Error fetching forms with TransactionId: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getDocumentList(
    transactionId: string,
    contextId: string,
    excludeForms: boolean = false,
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/documents${excludeForms ? '?excludeforms=true' : ''}`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;
      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data.value; // Return the list of documents and forms
    } catch (error) {
      throw new BadRequestException(
        `Error fetching documents with TransactionId: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async setTransactionData(
    transactionId: string,
    contextId: string,
    data: Record<string, any>,
    mode: 'Merge' | 'Replace' = 'Merge',
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/data?mode=${mode}`;
      const sharedKey = process.env.ZIPFORM_SHARED_KEY;
      const response = await axios.post(url, data, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': sharedKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException(
        `Error setting transaction data: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getTemplates(contextId: string, officeId?: string): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = officeId
        ? `${baseUrl}/templates/${officeId}`
        : `${baseUrl}/templates`;
      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': process.env.ZIPFORM_SHARED_KEY,
          'Content-Type': 'application/json',
        },
      });

      return response.data; // Return the list of templates
    } catch (error) {
      throw new BadRequestException(
        `Error fetching templates: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async applyTemplate(
    transactionId: string,
    templateId: string,
    contextId: string,
  ): Promise<any> {
    try {
      const baseUrl = 'https://api.pre.zipformplus.com/api';
      const url = `${baseUrl}/transactions/${transactionId}/apply/${templateId}`;
      const response = await axios.get(url, {
        headers: {
          'X-Auth-ContextId': contextId,
          'X-Auth-SharedKey': process.env.ZIPFORM_SHARED_KEY,
          'Content-Type': 'application/json',
        },
      });

      return response.data; // Return the response indicating success
    } catch (error) {
      throw new BadRequestException(
        `Error applying template: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}

//TODO: create transaction add the transaction to the form

//TODO:  agent create a form

// can add transaction to forms

//  can send the form via email

// Merer/ mpdify document

/// TODO:  Sign document
