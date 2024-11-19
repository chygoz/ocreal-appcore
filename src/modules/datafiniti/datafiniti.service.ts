import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format, isValid } from 'date-fns';

@Injectable()
export class DatafinitiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DATAINIFINITI_API_TOKEN');
    this.baseUrl = 'https://api.datafiniti.co/v4/properties/search';

    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'Datafiniti API token is missing in configuration.',
      );
    }
  }

  private buildQuery(params: {
    propertyType: string;
    location?: string;
    recentStatus?: string;
    dateUpdated?: string;
    priceRange?: { min: number; max: number };
  }): string {
    const { propertyType, location, recentStatus, dateUpdated, priceRange } =
      params;

    let query = `propertyType:"${propertyType}"`;

    if (location) {
      query += ` AND postalCode:${location}`;
    }

    if (recentStatus) {
      query += ` AND mostRecentStatus:"${recentStatus}"`;
    }

    if (dateUpdated) {
      query += ` AND dateUpdated:[${dateUpdated} TO *]`;
    }

    if (priceRange) {
      query += ` AND prices.amountMin:[${priceRange.min} TO ${priceRange.max}]`;
    }

    return query;
  }

  // async searchProperties(params: {
  //   propertyType: string;
  //   location?: string;
  //   recentStatus?: string;
  //   dateUpdated?: string;
  //   priceRange?: { min: number; max: number };
  // }) {
  //   const { propertyType, location, recentStatus, dateUpdated, priceRange } =
  //     params;

  //   const formattedDate =
  //     dateUpdated && isValid(new Date(dateUpdated))
  //       ? format(new Date(dateUpdated), 'yyyy-MM-dd')
  //       : undefined;

  //   const priceQuery = priceRange
  //     ? `AND prices.amountMin:[${priceRange.min} TO ${priceRange.max}]`
  //     : '';

  //   const query = [
  //     `propertyType:"${propertyType}"`,
  //     location ? `postalCode:${location}` : '',
  //     recentStatus ? `mostRecentStatus:"${recentStatus}"` : '',
  //     formattedDate ? `dateUpdated:[${formattedDate} TO *]` : '',
  //     priceQuery,
  //   ]
  //     .filter(Boolean)
  //     .join(' AND ');

  //   try {
  //     const response = await axios.post(
  //       this.baseUrl,
  //       {
  //         query,
  //         format: 'JSON',
  //         num_records: 1,
  //         download: false,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${this.apiKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     return response.data;
  //   } catch (error) {
  //     console.error(error.response);
  //     throw new BadRequestException(
  //       `Datafiniti API error: ${error.response?.data?.message || error.message}`,
  //     );
  //   }
  // }

  async searchProperties(
    query: string,
    numRecords: number,
    format: string = 'JSON',
    download: boolean = false,
  ) {
    try {
      console.log({
        query,
        format: 'JSON',
        numRecords,
        download: false,
      });

      const response = await axios.post(
        this.baseUrl,
        {
          query,
          format,
          num_records: numRecords,
          download,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response || error.message);
      throw new BadRequestException(
        `Datafiniti API error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async findComparableHomes(params: {
    address: string;
    city: string;
    province: string;
  }): Promise<any> {
    const { address, city, province } = params;

    const query = `address:"${address}" AND city:"${city}" AND province:"${province}"`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          query,
          format: 'JSON',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new BadRequestException(
        `Error finding comparable homes: ${message}`,
      );
    }
  }
}
