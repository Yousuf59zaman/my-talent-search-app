import { Component, DestroyRef, inject, isDevMode, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ScriptLoaderService } from './core/services/script-loader/script-loader.service';
import { IStaticMethods } from 'preline/preline';
import { delay, filter, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { LayoutComponent } from './core/layouts/layout/layout.component';
import { LocalstorageService } from './core/services/essentials/localstorage.service';
import { IsCorporateUser, LastUserType, LastUserTypes, UserId } from './shared/enums/app.enums';
import { CompanyId } from './shared/utils/app.const';
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [LayoutComponent]
})
export class AppComponent implements OnInit {
  title = 'cv-bank';
  formControlTest = new FormControl(false);

  private localStorageService = inject(LocalstorageService)
  private scriptLoader = inject(ScriptLoaderService);
  private destroyRef = inject(DestroyRef);
  private subscription = inject(Router)
    .events.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((event) => event instanceof NavigationEnd),
      delay(100),
      finalize(() => window.HSStaticMethods.autoInit())
    ).subscribe();

  async ngOnInit() {
    if (typeof window !== 'undefined' &&
      (await this.scriptLoader.loadScript('assets/js/preline.js'))) {
      window.HSStaticMethods.autoInit();
    }

    if (isDevMode()) {
      //sadman_test
      this.localStorageService.setItem(CompanyId, 'ZRLzZRdx')
      this.localStorageService.setItem(UserId, 'ZRYxPRG7')
      //dilruba test
      // this.localStorageService.setItem(CompanyId,'Zxg6ZRg=')
      // this.localStorageService.setItem(UserId,'PxZ9IES=')
      //have access
      // this.localStorageService.setItem(CompanyId,'ZxU0PRC=')
      // this.localStorageService.setItem(UserId,'ZRU1PiY3')
      // this.localStorageService.setItem(CompanyId,'ZRL0IEC9')
      // this.localStorageService.setItem(UserId,'ZRY1PRLx')
      //Bdjobs test account
      //  this.localStorageService.setItem(CompanyId,'ZxU0PRC=')
      // this.localStorageService.setItem(UserId,'ZRZ3ZiCw')
      //57151
      // this.localStorageService.setItem(CompanyId,'PRd9ZRd=')
      // this.localStorageService.setItem(UserId,'IRY1Pig=')

      //limit over have access
      //  this.localStorageService.setItem(CompanyId,'Zxg6ZRg=')
      //  this.localStorageService.setItem(UserId,'ZRCzZRGu')

      //test
      //  this.localStorageService.setItem(CompanyId,'ZRZ3IRd0')
      //  this.localStorageService.setItem(UserId,'ZC==')

      this.localStorageService.setItem(IsCorporateUser, 'false')
      this.localStorageService.setItem(LastUserType, LastUserTypes.Jobseeker)
    }
  }
}
