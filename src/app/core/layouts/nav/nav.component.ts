import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, EventEmitter, HostListener, inject, Output, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarService } from './services/navbar.service';
import { LocalstorageService } from '../../services/essentials/localstorage.service';
import { CompanyIdLocalStorage, IsAdminUser, LastUserType, LastUserTypes, UserId } from '../../../shared/enums/app.enums';
import { CreditSystem, cvSearchService, JobPostingService, NavResponse, SalesPersonData } from './class/navbarResponse';
import { DatePipe, NgClass } from '@angular/common';
import { ModalService } from '../../services/modal/modal.service';
import { NoCreditComponent } from '../../components/no-credit/no-credit.component';
import { NavDataService } from '../../services/nav-data.service';
import { NavDataStore } from './services/nav-data.store';
import { AuthService } from '../../services/auth/auth.service';
import { filter, interval, map, take } from 'rxjs';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NgClass, DatePipe, RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent implements AfterViewInit {
  private navbarService = inject(NavbarService);
  private localStorageService = inject(LocalstorageService);
  private modalService = inject(ModalService);
  private navDataService = inject(NavDataService);
  private navStore = inject(NavDataStore);
  private authService = inject(AuthService);

  @Output() navbarDataLoaded = new EventEmitter<SalesPersonData>();

  creditSystem: CreditSystem = {} as CreditSystem;
  cvSearchService: cvSearchService = {} as cvSearchService;
  jobPostingService: JobPostingService = {} as JobPostingService;
  currentDate: string = new Date().toString();
  cvBankPercentage: number = 0;
  navData: any;
  smsPercent = 0;
  loadingCreditSystem = signal(true);
  loadingCvSearchService = signal(true);
  loadingJobPostingService = signal(true);

  remainingBasicJobs = 0;
  maxBasicJobs = 0;
  remainingStandoutJobs = 0;
  remainingStandoutPremiumJobs = 0;
  maxStandoutJobs = 0;
  maxStandoutPremiumJobs = 0;
  jobPostingAccessPercentage: number = 0;
  companyName = computed(() => this.navStore.companyName());
  companyLogoURL = computed(() => this.navStore.companyLogoURL());
  // isAdminUser: boolean = window.localStorage.getItem(IsAdminUser) === 'true';
  isMenuOpen = signal(false);
  isCorporeteMenuOpen = signal (false)
  isCorporetProfileDropdownOpen = signal(false)
  isCorporetCreditDropdownOpen = signal(false)
  isCorporetTalentSearchDropdownOpen = signal(false)
  isCorporetSmsDropdownOpen = signal(false)
  isCorporetJobPostingDropdownOpen = signal(false)
  isCorporetProfileResDropdownOpen = signal(false)
  isCorporetCreditResDropdownOpen = signal(false)
  isCorporetTalentSearchResDropdownOpen = signal(false)
  isCorporetSmsResDropdownOpen = signal(false)
  isCorporetJobPostingResDropdownOpen = signal(false)
  IsCorporateUser = signal(
    this.localStorageService.getItem(LastUserType) === LastUserTypes.Corporate
  );

  isAdminUser = signal(
    this.localStorageService.getItem(IsAdminUser) === 'true'
  )

  fetchNavbarDataSub = interval(200)
    .pipe(
      map(() =>
        this.IsCorporateUser.set(
          this.localStorageService.getItem(LastUserType) ===
            LastUserTypes.Corporate
        ),
        this.isAdminUser.set(
          this.localStorageService.getItem(IsAdminUser) === 'true'
        )
      ),
      filter(
        () =>
          this.IsCorporateUser() &&
          !!this.localStorageService.getItem(CompanyIdLocalStorage)
      ),
      take(1)
    )
    .subscribe({
      next: () => {
        this.getNavbar();
        this.fetchNavbarDataSub.unsubscribe();
      },
    });

  @ViewChild('jobPostingDropdown', { static: false }) jobPostingDropdown!: ElementRef;
  @ViewChild('smsDropdown', { static: false }) smsDropdown!: ElementRef;
  @ViewChild('talentSearchDropdown', { static: false }) talentSearchDropdown!: ElementRef;
  @ViewChild('creditDropdown', { static: false }) creditDropdown!: ElementRef;
  @ViewChild('profileDropdown', { static: false }) profileDropdown!: ElementRef;
  @ViewChild('jobPostingResDropdown', { static: false }) jobPostingResDropdown!: ElementRef;
  @ViewChild('smsResDropdown', { static: false }) smsResDropdown!: ElementRef;
  @ViewChild('talentSearchResDropdown', { static: false }) talentSearchResDropdown!: ElementRef;
  @ViewChild('creditResDropdown', { static: false }) creditResDropdown!: ElementRef;
  @ViewChild('profileResDropdown', { static: false }) profileResDropdown!: ElementRef;
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.jobPostingDropdown && !this.jobPostingDropdown.nativeElement.contains(event.target)) {
      this.isCorporetJobPostingDropdownOpen.set(false) ;
    }
    if (this.smsDropdown && !this.smsDropdown.nativeElement.contains(event.target)) {
      this.isCorporetSmsDropdownOpen.set(false)
    }
    if (this.talentSearchDropdown && !this.talentSearchDropdown.nativeElement.contains(event.target)) {
      this.isCorporetTalentSearchDropdownOpen.set(false)
    }
    if (this.creditDropdown && !this.creditDropdown.nativeElement.contains(event.target)) {
      this.isCorporetCreditDropdownOpen.set(false)
    }
    if (this.profileDropdown && !this.profileDropdown.nativeElement.contains(event.target)) {
      this.isCorporetProfileDropdownOpen.set(false)
    }
    if (this.jobPostingResDropdown && !this.jobPostingResDropdown.nativeElement.contains(event.target)) {
      this.isCorporetJobPostingResDropdownOpen.set(false) ;
    }
    if (this.smsResDropdown && !this.smsResDropdown.nativeElement.contains(event.target)) {
      this.isCorporetSmsResDropdownOpen.set(false)
    }
    if (this.talentSearchResDropdown && !this.talentSearchResDropdown.nativeElement.contains(event.target)) {
      this.isCorporetTalentSearchResDropdownOpen.set(false)
    }
    if (this.creditResDropdown && !this.creditResDropdown.nativeElement.contains(event.target)) {
      this.isCorporetCreditResDropdownOpen.set(false)
    }
    if (this.profileResDropdown && !this.profileResDropdown.nativeElement.contains(event.target)) {
      this.isCorporetProfileResDropdownOpen.set(false)
    }

  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.HSStaticMethods.autoInit();
      }, 200);
    }
    setTimeout(() => {
      if (this.fetchNavbarDataSub && !this.fetchNavbarDataSub.closed) {
        this.fetchNavbarDataSub.unsubscribe();
      }
    }, 10000);
  }

  getNavbar() {
    const companyId = this.localStorageService.getItem(CompanyIdLocalStorage);
    const userId = this.localStorageService.getItem(UserId);

    this.navbarService.getNavbarData({ companyId, userId }).subscribe({
      next: (res: NavResponse) => {
        this.navbarDataLoaded.emit(res.data as SalesPersonData);
        this.navData = res.data;
        this.smsPercent =
          this.navData.smsPurchased > 0
            ? Math.ceil(
                (this.navData.smsRemaining * 100) / this.navData.smsPurchased
              )
            : 0;
        this.smsPercent = this.smsPercent < 0 ? 0 : this.smsPercent;

        this.creditSystem = (res.data.creditSystem ?? {}) as CreditSystem;
        this.cvSearchService = (res.data.cvSearchService ??
          {}) as cvSearchService;
        this.jobPostingService = (res.data.jobPostingService ??
          {}) as JobPostingService;

        this.loadingCreditSystem.set(this.isObjectEmpty(this.creditSystem));
        this.loadingCvSearchService.set(
          this.isObjectEmpty(this.cvSearchService)
        );
        this.loadingJobPostingService.set(
          this.isObjectEmpty(this.jobPostingService)
        );

        this.cvBankPercentage = Math.floor(
          (this.cvSearchService.available * 100) / this.cvSearchService.limit
        );
        this.jobPostingAssessShow();

        this.navDataService.updateNavData(res.data as SalesPersonData);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  openAddCreditModal(): void {
    this.modalService.setModalConfigs({
      attributes: {
        modalWidth: '700px',
      },
      inputs: {
        modalTitle: '',
        // Additional inputs can be added here
      },
      componentRef: NoCreditComponent,
    });
  }
  isObjectEmpty(obj: any): boolean {
    return (
      obj === null ||
      obj === undefined ||
      (typeof obj === 'object' && Object.keys(obj).length === 0)
    );
  }

  jobPostingAssessShow() {
    this.remainingBasicJobs = this.jobPostingService?.basicListLimit ?? 0;

    this.maxBasicJobs = this.jobPostingService?.maxJob ?? 0;

    this.remainingStandoutJobs = this.jobPostingService?.standoutLimit ?? 0;
    this.maxStandoutJobs = this.jobPostingService?.maxStandout ?? 0;

    this.remainingStandoutPremiumJobs =
      this.jobPostingService?.standoutPremiumLimit ?? 0;

    this.maxStandoutPremiumJobs =
      this.jobPostingService?.maxStandoutPremium ?? 0;

    const remainingJobsSum =
      this.remainingBasicJobs +
      this.remainingStandoutJobs +
      this.remainingStandoutPremiumJobs;

    const maxJobsSum =
      this.maxBasicJobs + this.maxStandoutJobs + this.maxStandoutPremiumJobs;

    if (maxJobsSum > 0) {
      this.jobPostingAccessPercentage = Math.round(
        (remainingJobsSum / maxJobsSum) * 100
      );
    }
  }
}


