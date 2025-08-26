import { NavDataService } from './../../../core/services/nav-data.service';
import { AfterViewInit, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SavedSearchComponent } from "../../saved-search/saved-search/saved-search.component";
import { SearchTalentComponent } from '../../search-talent/search-talent/search-talent.component';
import { Router, RouterLink } from '@angular/router';
import { IsCorporateUser } from '../../../shared/enums/app.enums';
import { NgClass } from '@angular/common';
import { BdJobsAnalyticsService } from '../../bd-jobs-analytics/bd-jobs-analytics.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, filter, of, tap } from 'rxjs';
import { CompanyVerifyModalComponent } from '../../modal/company-verify-modal/company-verify-modal.component';
import { ModalService } from '../../../core/services/modal/modal.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SearchTalentComponent,
    SavedSearchComponent,
    RouterLink,
    NgClass,
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  IsCorporateUser = signal(false)
  showButton = signal(false);
  navDataService=inject(NavDataService);
  private router = inject(Router);
  bdJobsAnalyticsService = inject (BdJobsAnalyticsService)
  private destroyRef = inject(DestroyRef);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  avatarUrls = [
    'images/riyad.svg',
    'images/rizon.svg',
    'images/lijon.svg',
    'images/tanver.svg',
    'images/fazlul.svg'
  ];

  analytics = of(null)
    .pipe(
      delay(2000),
      tap(() => this.sendUserActivity())
    ).subscribe()
  
  ngOnInit() {
    const value = localStorage.getItem(IsCorporateUser);
    this.IsCorporateUser.set(value === 'true');
    window.addEventListener('scroll', () => {
      this.showButton.set(window.scrollY > 300);
    });
  }

  salesPersonData = computed(() => this.navDataService.navData());
  CvBankSearchAccess = computed(() => this.salesPersonData()?.cvSearchAccess === true);

  // redirectTo(type: string) {
  //   location.href = type === 'puchase-list' ? '' : 'moveToSavedFiltersList()';
  // }

  sendUserActivity(){
    const activityType = 'Dashboard'
    const activity = 1
    const activityName = ''
    this.bdJobsAnalyticsService.sendDeviceInfoToServer(activityType,activity,activityName)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe()
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showButton.set(false);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.IsCorporateUser()) {
        this.navDataService.isValidJobSeeker()
        .subscribe({
          next: (res) => {
            if (res && !res.iseligible) {
              this.modalService.setModalConfigs({
                attributes: {
                  modalWidth: '500px',
                },
                componentRef: CompanyVerifyModalComponent,
              });
            }
          }
        })
      }
    }, 2000);
  }

  moveToSavedFiltersList() {
    this.router.navigate(['/cv-search'], {
      queryParams: { ref: 'saved-filters' },
    });
  }
   
  moveToPurchaseList() {
    this.router.navigate(['/cv-search'], {
      queryParams: { ref: 'purchase-list' },
    });
  }
}
