import {
  HttpInterceptorFn,
  HttpEvent,
  HttpResponse,
  HttpStatusCode,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError } from 'rxjs';
import { IResponse } from '../../../shared/models/response';
import { ResponseCode } from '../../../shared/enums/app.enums';

class HttpResponseBodyFormatError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class HttpNoNetworkConnectionError extends Error {
  wasCaught = false;

  constructor() {
    super('No network connection');
  }
}

const MESSAGES = {
  INTERNAL_ERROR: 'An internal error has occurred. Please try again later.',
  NO_CONNECTION: 'No network connection. Please try again later.',
  BAD_REQUEST: 'Bad Request. Please try again later',
};

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    tap((httpEvent) => {
      if (checkInvalid200Response(httpEvent)) {
        if (httpEvent instanceof HttpResponse) {
          const res: any = httpEvent as any;
          throw new HttpResponseBodyFormatError(res.body?.dataContext[0].message);
        } else {
          throw new HttpResponseBodyFormatError('Invalid response body format');
        }
      }
    }),
    catchError((error) => {
      if(error instanceof HttpResponseBodyFormatError) {
        toastr.error(error.message ? error.message : 'Invalid response body format', '', { timeOut: 2000 });
        throw error;
      } else {
        let errorMessage: string;
        if (checkNoNetworkConnection(error)) {
          errorMessage = MESSAGES.NO_CONNECTION;
          error = new HttpNoNetworkConnectionError();
          error.wasCaught = true;
        } else if (is400ResponseError(error)) {
          errorMessage = MESSAGES.BAD_REQUEST;
        } else {
          errorMessage = MESSAGES.INTERNAL_ERROR;
        }
        if (errorMessage) {
          toastr.error(errorMessage, '', { timeOut: 2000 });
        }
        throw error;
      }
    })
  );
};

function checkInvalid200Response(httpEvent: HttpEvent<any>): boolean {
  return (
    httpEvent instanceof HttpResponse &&
    httpEvent.status === HttpStatusCode.Ok &&
    !ExceptionUrls.some((url) => httpEvent.url?.includes(url)) &&
    !check200ResponseBodyFormat(httpEvent)
  );
}

const isPlainObject = (value: any) => value?.constructor === Object;

function check200ResponseBodyFormat(
  response: HttpResponse<IResponse>
): boolean {
  return (
    isPlainObject(response.body) &&
    (((response.body?.hasOwnProperty('Error') as boolean) &&
      response.body?.Error == '0') ||
      ((response.body?.hasOwnProperty('responseCode') as boolean) &&
        response.body?.responseCode === ResponseCode.success &&
        response.body?.dataContext === null))
  );
}

function checkNoNetworkConnection(error: any): boolean {
  return (
    error instanceof HttpErrorResponse &&
    !error.headers.keys().length &&
    !error.ok &&
    !error.status &&
    !error.error.loaded &&
    !error.error.total
  );
}

function is400ResponseError(error: any) {
  return (
    error instanceof HttpErrorResponse &&
    error.status === HttpStatusCode.BadRequest
  );
}


const ExceptionUrls = ['excelGenerator/api/savedata','recruiter.bdjobs.com/authentication', 'onlinetest.bdjobs.com/OnlineTest_MCQUpload/UploadExcel','FileUpload/download_cv']