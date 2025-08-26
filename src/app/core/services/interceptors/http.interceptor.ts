import { inject, Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpRequest,
    HttpInterceptor,
    HttpErrorResponse,
    HttpClient
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { CookieService } from '../cookie/cookie.service';
import { Cookies, RecruiterPanelUrl } from '../../../shared/enums/app.enums';
import { redirectExternal } from '../../../shared/utils/functions';
import { Router } from '@angular/router';

@Injectable()
export class HTTPInterceptor implements HttpInterceptor {

    private readonly cookieService = inject(CookieService);
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const accessToken = this.cookieService.getCookie(Cookies.AUTH);
        if (request.url.includes(AspApiEndpoint)) {
          request = request.clone({
            withCredentials: true,
            setHeaders: {
              'Content-Type': `application/x-www-form-urlencoded`,
            },
            params: request.params.set(
              'domain',
              this.getCurrentUrl().includes('recruiter.bdjobs.com')
                ? 'recruiter'
                : this.getCurrentUrl().includes('gateway.bdjobs.com')
                ? 'gateway'
                : 'test'
            )         
          });
        }

        return next.handle(request).pipe(
            catchError((err: HttpErrorResponse) => this.handleError(err, request, next))
        );
    }

    private getCurrentUrl(): string {
      return window.location.href;
    }

    private handleError(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler) {
        if (error.status === 401) {
          return this.refreshToken(request, next);
        }

        return throwError(() => error);
    }

    private refreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const refreshToken = this.cookieService.getCookie(Cookies.REFTOKEN);
      
        if (!refreshToken) {
          return throwError(() => this.redirectToRecruiterApp());
        }

        const refreshTokenUrl = 'refresh-token-api-endpoint';
        const refreshTokenBody = { refreshToken };
      
        return this.http
          .post<any>(refreshTokenUrl, refreshTokenBody)
          .pipe(
            map((response) => {
              const newAccessToken = response.accessToken;
              const newRefreshToken = response.refreshToken;
              this.cookieService.setCookie(Cookies.AUTH, newAccessToken, 5);
              this.cookieService.setCookie(Cookies.REFTOKEN, newRefreshToken, 5);
              return request.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` }
              });
            }),
            catchError((error) => {
                return throwError(() => this.redirectToRecruiterApp());
            })
          )
          .pipe(
            mergeMap((updatedRequest) => next.handle(updatedRequest))
          );
      }


      private redirectToRecruiterApp() {
        redirectExternal(RecruiterPanelUrl)
      }
}

export const AspApiEndpoint = '.asp';