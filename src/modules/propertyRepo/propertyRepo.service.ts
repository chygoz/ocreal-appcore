import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../users/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PropertyDocumentRepo } from '../propertyRepo/schema/propertyDocumentRepo.schema';
import { Agent } from '../agent/schema/agent.schema';
import { CreatePropertyDocumentDto } from '../property/dto/AddProperty.dto';
import { Property } from '../property/schema/property.schema';
import { PaginationDto } from 'src/constants/pagination.dto';
import * as docusign from 'docusign-esign';
import * as fs from 'fs';
import * as path from 'path';
import { configs } from 'src/configs';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PropertyRepoService {
  private apiClient: docusign.ApiClient;
  constructor(
    @InjectModel(PropertyDocumentRepo.name)
    private propertyDocumentRepo: Model<PropertyDocumentRepo>,
    @InjectModel(Property.name)
    private propertyModel: Model<Property>,
    private readonly s3Service: S3Service,
  ) {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(configs.DOCUSIGN_BASE_PATH);
    this.apiClient.addDefaultHeader(
      'Authorization',
      'Bearer ' + this._getAccessToken(),
    );
  }

  async getAllPropertyDocuments(
    user: User | Agent,
    propertyId: string,
    paginationDto: PaginationDto,
  ) {
    // confirm user access here
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (search) {
      query['$or'] = [
        {
          name: new RegExp(new RegExp(search, 'i'), 'i'),
        },
        {
          documentType: new RegExp(new RegExp(search, 'i'), 'i'),
        },
      ];
    }
    const queryObject = search
      ? { ...query, property: new Types.ObjectId(propertyId) }
      : { property: new Types.ObjectId(propertyId) };
    console.log(queryObject);
    const [result, total] = await Promise.all([
      this.propertyDocumentRepo
        .find(queryObject)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyDocumentRepo.countDocuments(queryObject),
    ]);

    return { result, total, page, limit };
  }

  async addToPropertyRepo(
    user: User | Agent,
    userOrAgentModel: string,
    propertyId: string,
    dto: CreatePropertyDocumentDto,
  ) {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const newDocument = await this.propertyDocumentRepo.create({
      ...dto,
      userOrAgentModel,
      userOrAgent: user._id,
      property: new Types.ObjectId(propertyId),
    });
    const saved = await newDocument.save();
    return saved;
  }

  async deletePropertyDocument(user: User | Agent, documentId: string) {
    const propertyDoc = await this.propertyDocumentRepo.findOne({
      _id: new Types.ObjectId(documentId),
      userOrAgent: user._id,
    });
    if (!propertyDoc) {
      throw new NotFoundException('Property Document not found');
    }
    await this.propertyDocumentRepo.findByIdAndDelete(propertyDoc._id);
    return true;
  }

  async createDocuSignClient(): docusign.ApiClient {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath('https://demo.docusign.net/restapi');
    apiClient.addDefaultHeader(
      'Authorization',
      'Bearer ' + this._getAccessToken(),
    );
  }

  // private async getAccessToken(): Promise<string> {
  //   console.log(configs.DOCUSIGN_PRIVATE_KEY);
  //   const results = await this.createDocuSignClient().requestJWTUserToken(
  //     configs.DOCUSIGN_USER_ID,
  //     configs.DOCUSIGN_USER_ID,
  //     'signature',
  //     Buffer.from(configs.DOCUSIGN_PRIVATE_KEY, 'base64').toString('utf-8'),
  //     3600,
  //   );

  //   const { access_token } = results.body;
  //   return access_token;
  // }

  // private async
  // async function authenticateDocusign(){
  //   const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
  //   const dsApi = new docusign.ApiClient();
  //   dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
  //   let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);

  //   try {
  //     const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
  //       jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
  //       jwtLifeSec);
  //     const accessToken = results.body.access_token;

  //     // get user info
  //     const userInfoResults = await dsApi.getUserInfo(accessToken);

  //     // use the default account
  //     let userInfo = userInfoResults.accounts.find(account =>
  //       account.isDefault === 'true');

  //     return {
  //       accessToken: results.body.access_token,
  //       apiAccountId: userInfo.accountId,
  //       basePath: `${userInfo.baseUri}/restapi`
  //     };
  //   } catch (e) {
  //     console.log(e);
  //     let body = e.response && e.response.body;
  //     // Determine the source of the error
  //     if (body) {
  //         // The user needs to grant consent
  //       if (body.error && body.error === 'consent_required') {
  //         if (getConsent()){ return authenticate(); };
  //       } else {
  //         // Consent has been granted. Show status code for DocuSign API error
  //         this._debug_log(`\nAPI problem: Status code ${e.response.status}, message body:
  //         ${JSON.stringify(body, null, 4)}\n\n`);
  //       }
  //     }
  //   }
  // }

  private async _getAccessToken(): Promise<string> {
    this.apiClient.setOAuthBasePath(
      'https://account-d.docusign.com'.replace('https://', ''),
    );
    const privateKeyPath = path.resolve(
      __dirname,
      '../../../keys/docusign_private.key',
    );
    const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
    try {
      const results = await this.apiClient.requestJWTUserToken(
        configs.DOCUSIGN_INTEGRATOR_KEY,
        configs.DOCUSIGN_USERNAME,
        null,
        privateKey, //TODO: CONTINUE FROM HERE WITH SETTING UP THE DOCUSIGN KEY, REVIEW GPT CODE ALSO
        3600,
      );

      return results.body.access_token;
    } catch (e) {
      console.log(e);
      const body = e.response && e.response.body;
      // Determine the source of the error
      if (body) {
        // The user needs to grant consent
        // if (body.error && body.error === 'consent_required') {
        //   if (getConsent()) {
        //     return authenticate();
        //   }
        // } else {
        //   // Consent has been granted. Show status code for DocuSign API error
        //   this
        //     ._debug_log(`\nAPI problem: Status code ${e.response.status}, message body:
        //   ${JSON.stringify(body, null, 4)}\n\n`);
        // }
      }
    }
  }

  public async createEnvelope(
    recipient: User | Agent,
    documents: Array<PropertyDocumentRepo>,
  ) {
    const accessToken = await this._getAccessToken();
    this.createDocuSignClient().addDefaultHeader(
      'Authorization',
      'Bearer ' + accessToken,
    );

    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Please sign this document';

    const envelopDocuments = [];
    for (const doc of documents) {
      const document = await this.s3Service.getDocumentFromS3AndPrepForDocusign(
        doc.name,
        doc.url,
        doc._id.toString(),
      );
      envelopDocuments.push(document);
    }

    envelopeDefinition.documents = envelopDocuments;

    const signer = new docusign.Signer();
    signer.email = recipient.email;
    signer.name = recipient.firstname + ' ' + recipient.lastname;
    signer.recipientId = '1';
    signer.clientUserId = recipient._id;

    // const signHere = new docusign.SignHere();
    // signHere.documentId = '1';
    // signHere.pageNumber = '1';
    // signHere.recipientId = '1';
    // signHere.tabLabel = 'SignHereTab';
    // signHere.xPosition = '200';
    // signHere.yPosition = '400';

    // const tabs = new docusign.Tabs();
    // tabs.signHereTabs = [signHere];
    // signer.tabs = tabs;

    envelopeDefinition.recipients = new docusign.Recipients();
    envelopeDefinition.recipients.signers = [signer];

    envelopeDefinition.status = 'sent';

    const envelopesApi = new docusign.EnvelopesApi(this.createDocuSignClient());
    const results = await envelopesApi.createEnvelope(
      configs.DOCUSIGN_ACCOUNT_ID,
      { envelopeDefinition },
    );
    return results.envelopeId;
  }

  public async getEmbeddedSigningUrl(
    envelopeId: string,
    recipientEmail: string,
    recipientName: string,
  ) {
    const accessToken = await this._getAccessToken();
    this.createDocuSignClient().addDefaultHeader(
      'Authorization',
      'Bearer ' + accessToken,
    );

    const viewRequest = new docusign.RecipientViewRequest();

    viewRequest.returnUrl = configs.DOCUSIGN_REDIRECT_URI;
    viewRequest.authenticationMethod = 'email';
    viewRequest.email = recipientEmail;
    viewRequest.userName = recipientName;
    viewRequest.clientUserId = '1234';

    const envelopesApi = new docusign.EnvelopesApi(this.createDocuSignClient());
    const results = await envelopesApi.createRecipientView(
      configs.DOCUSIGN_ACCOUNT_ID,
      envelopeId,
      { recipientViewRequest: viewRequest },
    );
    return results.url;
  }
}
