import { DestroyRef, inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { LocalstorageService } from '../services/essentials/localstorage.service';
import { JobNoLocalStorage, UserId } from '../../shared/enums/app.enums';
import { catchError, map, Observable, of, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard {
  private localStorageService = inject(LocalstorageService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  // canActivate(): Observable<boolean> {
  //   // return this.hasAccess();
  // }

  // canActivateChild(): Observable<boolean> {
  //   // return this.hasAccess();
  // }

  // private hasAccess(): Observable<boolean> {
  //   let jobid: string | null = '';
  //   const searchParams = new URLSearchParams(location.search);
  //   if (!searchParams) return of(false);
  //   if (searchParams.has(JobNoLocalStorage)) {
  //       jobid = searchParams.get(JobNoLocalStorage);
  //       if (jobid)  this.localStorageService.setItem(
  //           JobNoLocalStorage,
  //           jobid
  //         );
  //   }
  //   if (!jobid) return of(false);
  //   return this.jobInfoService.getJobInformation(+jobid).pipe(
  //     take(1),
  //     takeUntilDestroyed(this.destroyRef),
  //     map((jobInfo: JobInfoApiResponse) =>
  //       jobInfo.data.userID.some(
  //         (role) => role === this.localStorageService.getItem(UserId)
  //       )
  //     ),
  //     catchError(() => of(false)),
  //     tap((res) => {
  //       if (!res) this.router.navigate(['/not-authorised']);
  //     })
  //   );
  // }
}