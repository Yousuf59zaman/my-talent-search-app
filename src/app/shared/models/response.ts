import { ResponseCode, ResponseType } from '../enums/app.enums';

export interface ApiResponse<T> {
  responseType?: ResponseType;
  dataContext?: null | DataContext;
  responseCode?: ResponseCode;
  requestedData?: null;
  data?: T;
}

export interface DataContext {
  errorCode: number;
  name: string;
  invalidValue: string;
  message: string;
}

export interface ApiResponseOld {
  Error: string;
  Message: string;
}

export interface IResponse extends ApiResponse<any> {
  Error: string;
  Message: string;
}

export interface CustomCvDownloadResponse {
  status: number;
  message: string;
  fileExtention: string;
  fileType: string;
  file: string;
  data: any;
  common: any;
}
