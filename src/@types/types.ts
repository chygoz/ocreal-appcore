import { Response, Request } from "express";

export interface IResponse {
  req: Request;
  res: Response;
  message?: string;
  data?: any_object;
  status_code?: number;
}

export type any_object = Record<string, unknown>;


export interface Request_query {
  skip?: any;
  page?: string;
  limit?: string;
  search?: string;
}
export interface Pagination {
  current: number;
  number_of_pages: number;
  perPage: number;
  next: number;
}
export interface Request_filter {
  search?: string;
  status?: string;
  interval?: string;
  startDate?: string;
  endDate?: string;
}

export interface IGoogleUser {
  id: string;
  refresh_token: string;
  access_token: string;
  email: string;
  avatar?: string;
  verified: boolean;
  displayName: string;
  location?: string;
}

