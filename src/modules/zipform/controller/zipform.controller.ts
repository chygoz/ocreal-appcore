import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ZipFormService } from '../service/zipform.service';
import { CreateTransactionDto } from '../dto/zipform.dtos';
import { AgentOrSellerAuthGuard } from 'src/guards/seller_or_agent.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('zipform')
export class ZipFormController {
  constructor(private readonly zipFormService: ZipFormService) {}

  @Get('authenticate')
  async authenticateUser() {
    const contextId = await this.zipFormService.authenticateUser();
    return { contextId };
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Post('transaction')
  async CreateTransaction(
    @Body() payload: CreateTransactionDto,
    @Request() req,
  ) {
    try {
      const contextId = await this.zipFormService.authenticateUser();
      console.log(contextId);
      const agentId = req.agent._id;
      console.log(agentId);

      if (contextId) {
        const transaction = await this.zipFormService.createTransaction(
          payload,
          contextId,
          agentId,
        );
        return transaction;
      }
      return { error: 'Unable to create transaction , authentication failed.' };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AgentOrSellerAuthGuard)
  @Get('list-transactions')
  async ListAgentTransaction(@Request() req) {
    const agentId = req.agent._id;
    return this.zipFormService.listAgentTransaction(agentId);
  }

  @Get('transaction/:id')
  async getTransaction(@Param('id') id: string) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.getTransaction(id, contextId);
  }

  @Get('libraries')
  async getAgentLibraries() {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.getAgentLibraries(contextId);
  }

  @Get('libraries/:id/:name/:version')
  async getLibraryForms(
    @Param('id') id: string,
    @Param('name') name: string,
    @Param('version') version: string,
  ) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.getLibraryForms(
      id,
      name,
      version,
      contextId,
    );
  }

  @Post('add-to-form/:transactionId')
  async addForm(
    @Param('transactionId') transactionId: string,
    @Body() body: { formId: string },
  ) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.addFormToTransaction(
      transactionId,
      body.formId,
      contextId,
    );
  }

  @Get(':id/documents/:documentId')
  async getDocumentContents(
    @Param('id') transactionId: string,
    @Param('documentId') documentId: string,
    @Request() req,
  ) {
    const contextId = await this.zipFormService.authenticateUser(); // Ensure you have a method to get the context ID
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.getDocumentContents(
      transactionId,
      documentId,
      req.query.version,
      contextId,
    );
  }

  @Get(':id/documents/:documentId/meta')
  async getDocumentMetadata(
    @Param('id') transactionId: string,
    @Param('documentId') documentId: string,
    @Request() req,
  ) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.getDocumentMetadata(
      transactionId,
      documentId,
      contextId,
    );
  }

  @Get('libraries/:libraryId/forms')
  async getForms(@Param('libraryId') libraryId: string, @Request() req) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    return await this.zipFormService.getFormsFromLibrary(libraryId, contextId);
  }

  @Get('forms/:transactionId')
  async getFormsByTransactionId(@Param('transactionId') transactionId: string) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    const forms = await this.zipFormService.getFormsByTransitionId(
      transactionId,
      contextId,
    );
    return { forms };
  }

  @Get('documents/:transactionId')
  async getDocumentList(
    @Param('transactionId') transactionId: string,
    @Query('excludeforms') excludeForms: string,
    @Request() req,
  ) {
    const contextId = await this.zipFormService.authenticateUser(); // Ensure you have a method to get the context ID
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    const excludeFormsFlag = excludeForms === 'true'; // Convert query parameter to boolean

    const documents = await this.zipFormService.getDocumentList(
      transactionId,
      contextId,
      excludeFormsFlag,
    );
    return { documents };
  }

  @Post('update-transaction/:transactionId')
  async setTransactionData(
    @Param('id') transactionId: string,
    @Body() data: Record<string, any>,
    @Query('mode') mode: 'Merge' | 'Replace',
    @Request() req,
  ) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    try {
      const result = await this.zipFormService.setTransactionData(
        transactionId,
        contextId,
        data,
        mode,
      );
      return { result };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('template')
  async getTemplates(@Request() req, @Query('officeId') officeId?: string) {
    const contextId = await this.zipFormService.authenticateUser(); // Ensure you have a method to get the context ID
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    try {
      const templates = await this.zipFormService.getTemplates(
        contextId,
        officeId,
      );
      return { templates }; // Return the list of templates
    } catch (error) {
      return { error: error.message }; // Return the error message if something goes wrong
    }
  }

  @Get('transactions/:transactionId/apply/:templateId')
  async applyTemplate(
    @Param('transactionId') transactionId: string,
    @Param('templateId') templateId: string,
    @Request() req,
  ) {
    const contextId = await this.zipFormService.authenticateUser(); // Ensure you have a method to get the context ID
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    try {
      const result = await this.zipFormService.applyTemplate(
        transactionId,
        templateId,
        contextId,
      );
      return { result }; // Return the result indicating success
    } catch (error) {
      return { error: error.message }; // Return the error message if something goes wrong
    }
  }

  @Post(':transactionId/documents/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('transactionId') transactionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('Description') description: string,
    @Query('Name') name: string,
    @Query('ContainerId') containerId?: string,
    @Query('Id') documentId?: string,
  ) {
    const contextId = await this.zipFormService.authenticateUser();
    if (!contextId) {
      return { error: 'Unable to authenticate user.' };
    }

    try {
      const result = await this.zipFormService.uploadDocument(
        transactionId,
        contextId,
        file.buffer, // Use the buffer from the uploaded file
        name,
        description,
        containerId,
        documentId,
      );
      return { result }; // Return the result in a structured response
    } catch (error) {
      return { error: error.message }; // Return the error message if something goes wrong
    }
  }
}
