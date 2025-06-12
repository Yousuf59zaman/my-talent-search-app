import { inject, Injectable, signal } from '@angular/core';
import { SalesPersonData } from '../layouts/nav/class/navbarResponse';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie/cookie.service';
import { Cookies } from '../../shared/enums/app.enums';

@Injectable({
  providedIn: 'root'
})
export class NavDataService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);

  private navDataSignal = signal<SalesPersonData | null>(null);
  private cvbankAccessLimitExpiredSignal = signal<boolean>(false);
  
  readonly navData = this.navDataSignal.asReadonly();
  readonly cvbankAccessLimitExpired = this.cvbankAccessLimitExpiredSignal.asReadonly();
  
  updateNavData(data: SalesPersonData): void {
    this.navDataSignal.set(data);
    if (data?.cvSearchService && data.cvSearchService.viewed >= data.cvSearchService.limit) {
      this.cvbankAccessLimitExpiredSignal.set(true);
    } else {
      this.cvbankAccessLimitExpiredSignal.set(false);
    }
  }

  isValidJobSeeker() {
    const mybdjobsUserIdCookie = this.cookieService.getCookie(Cookies.MybdjobsUserId) || '';
    const body = new URLSearchParams();
    body.set('EID', decodeURIComponent(mybdjobsUserIdCookie));

    return this.http.post<{
      statusCode: number;
      message: string;
      iseligible: boolean;
    }>(
      'https://api.bdjobs.com/mybdjobs/api/v1/TalentSearch/isValid',
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
  }
}