import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LocalstorageService } from '../services/essentials/localstorage.service';
import { LastUserType, LastUserTypes } from '../../shared/enums/app.enums';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild  {

  private authService = inject(AuthService);
  private localStorageService = inject(LocalstorageService);

  canActivate(): Observable<boolean> | boolean {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean> | boolean {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean> | boolean {
    if (!environment.production) {
      return true;
    }

    const referrer = document.referrer;
    const lastUserType = this.localStorageService.getItem(LastUserType);
    const isRecruiterRef = referrer && referrer.includes('recruiter.bdjobs.com');
    const isJobseekerRef = referrer && (referrer.includes('mybdjobs.bdjobs.com') || referrer.includes('bdjobs.com'));

    // 1. Recruiter referrer
    if (isRecruiterRef && this.authService.hasRecruiterAuthToken()) {
      this.authService.getRecturerUserInfo();
      return true;
    }

    // 2. Jobseeker referrer
    if (isJobseekerRef && this.authService.hasMybdjobsUserId()) {
      return this.resolveJobSeekerDependencies();
    }

    // 3. No referrer
    if (!referrer) {
      if (lastUserType === LastUserTypes.Corporate) {
        this.authService.getRecturerUserInfo();
        return true;
      }
      if (lastUserType === LastUserTypes.Jobseeker) {
        return this.resolveJobSeekerDependencies();
      }
      if (this.authService.hasRecruiterAuthToken()) {
        this.authService.getRecturerUserInfo();
        return true;
      }
      if (this.authService.hasMybdjobsUserId()) {
        return this.resolveJobSeekerDependencies();
      }
      this.authService.redirectToBdjobs();
      return false;
    }

    // 4. All other cases (invalid referrer)
    this.authService.redirectToBdjobs();
    return false;
  }

  private resolveJobSeekerDependencies() {
    return this.authService.resolveJobseekerCompanyId().pipe(
        map(success => {
          if (!success) {
            this.authService.redirectToMybdjobsApp();
          }
          return success;
        }),
        catchError(() => {
          this.authService.redirectToMybdjobsApp();
          return of(false);
        })
      );
  }

}