import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterPanelComponent } from '../../filter-panel/filter-panel.component';
import { ApplicantCardComponent } from "../../applicant/applicant-card/applicant-card.component";
import { ActiveFiltersComponent, FilterBadge } from "../../active-filters/active-filters/active-filters.component";
import { CommonModule } from '@angular/common';
import { QueryService } from '../../filter-panel/services/query.service';
import { FilterStore } from '../../../store/filter.store';
import { delay, filter, map, of, tap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { generateFilterBadges } from '../../filter-panel/utility/functions';
import { TabsComponent, TabItem } from '../../tabs/tabs.component';
import { HomeQueryStore } from '../../../store/home-query.store';
import { CardSkeletonLoaderComponent } from "../../../shared/components/skeleton-loader/skeleton-loader.component";
import { NumberSuffixPipe } from '../../../shared/pipes/number-suffix.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { DefaultPageSize } from '../../../shared/utils/app.const';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApplicantCardService } from '../../applicant/services/applicant-card.service';
import { PurchaseList } from '../../applicant/models/applicant.model';
import { ActivatedRoute } from '@angular/router';
import { IsCorporateUser } from '../../../shared/enums/app.enums';
import { BdJobsAnalyticsService } from '../../bd-jobs-analytics/bd-jobs-analytics.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';

@Component({
  selector: 'app-cv-search',
  standalone: true,
  imports: [
    FilterPanelComponent,
    ApplicantCardComponent,
    ActiveFiltersComponent,
    CommonModule,
    ReactiveFormsModule,
    TabsComponent,
    CardSkeletonLoaderComponent,
    NumberSuffixPipe,
    PaginationComponent,
    NgxPaginationModule,
  ],
  templateUrl: './cv-search.component.html',
  styleUrl: './cv-search.component.scss',
})
export class CvSearchComponent {
  private queryService = inject(QueryService);
  private filterStore = inject(FilterStore);
  private homeQueryStore = inject(HomeQueryStore);
  protected ApplicantCardService = inject(ApplicantCardService);
  private activatedRoute = inject(ActivatedRoute);
  bdJobsAnalyticsService = inject (BdJobsAnalyticsService)
  private destroyRef = inject(DestroyRef);
  localStorageService = inject(LocalstorageService);
  IsCorporateUser = signal(false)
  pageNo = signal(1);
  total = signal(0);
  showButton = signal(false);
  itemsPerPage = signal<number>(DefaultPageSize);
  totalCvCount = computed(() => this.filterStore.totalCvCount() || 0);
  isCorporateUser = computed(() => this.localStorageService.getItem(IsCorporateUser) === 'true');
  
  activeFiltersBadges = computed(() =>
    generateFilterBadges(this.activeFilters())
  );
  filtersFromDashboard = computed(() => this.homeQueryStore.filter());
  shortlistData = toSignal(
    this.activatedRoute.queryParams.pipe(
      takeUntilDestroyed(),
      filter((query) => query && query['shortlistId'] && query['shortlistName']),
      map((query) => ({
        id: query['shortlistId'],
        name: query['shortlistName']
      }))
    ), { initialValue: undefined }
  );

  removedFilter = signal<FilterBadge | null>(null);
  isLoading = toSignal(this.queryService.isQueryLoading, {
    initialValue: true,
  });

  applicants = toSignal(
    this.queryService.filterQueryRes$.pipe(
      filter((res) => res && res.cvBankDetails.length >= 0),
      tap((res) => {
        this.queryService.isQueryLoading.next(false);
        this.pageNo.update(() => +res.pageNo);
      }),
      map((res) => res.cvBankDetails)
    ),
    { initialValue: [] }
  );

  corporateUserTabs = signal<TabItem[]>([
    { id: 'cv-search', label: 'Talent Search', count: 0 },
    {
      id: 'saved-filters',
      label: 'Saved Filters',
      count: 3,
      isExternalLink: true,
      externalUrl: 'https://corporate3.bdjobs.com/SaveFilter.asp?from=cvbank',
    },
    {
      id: 'shortlisted-cvs',
      label: 'Shortlisted CVs',
      count: 3,
      isExternalLink: true,
      externalUrl:
        'https://corporate3.bdjobs.com/ShortlistedCVs.asp?pgtype=wl&from=',
    },
    {
      id: 'purchase-list',
      label: 'Purchase List',
      count: 24,
      isExternalLink: true,
      externalUrl: 'https://corporate3.bdjobs.com/PurchaseList.asp?from=cvbank',
    },
  ]);
  jobSeekUserTabs = signal<TabItem[]>([
    { id: 'cv-search', label: 'Talent Search', count: 0 },
    {
      id: 'saved-filters',
      label: 'Saved Filters',
      count: 3,
      isExternalLink: true,
      externalUrl: 'https://corporate3.bdjobs.com/SaveFilter.asp?from=cvbank',
    },
    {
      id: 'Talent Basket',
      label: 'Talent Basket',
      count: 24,
      isExternalLink: true,
      externalUrl: 'https://corporate3.bdjobs.com/PurchaseList.asp?from=cvbank',
    },
  ]);
  activeTab = signal('cv-search');

  activeFilters = toSignal(this.queryService.filterQuery$, {
    initialValue: null,
  });

  ngOnInit() {
    window.addEventListener('scroll', () => {
      this.showButton.set(window.scrollY > 300);
    });
    const value = localStorage.getItem(IsCorporateUser);
    this.IsCorporateUser.set(value === 'true');
  }

  analytics = of(null)
    .pipe(
      delay(2000),
      tap(() => this.sendUserActivity())
    ).subscribe();

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showButton.set(false);
  }

  loadMore() {
    const currentPagination = this.queryService.pagination;
    this.queryService.pagination = {
      ...currentPagination,
      pageNo: currentPagination.pageNo + 1,
    };
  }

  updateRemovedBadge(badge: FilterBadge): void {
    this.removedFilter.set(badge);
  }

  onPageChangeEvent(pageNo: number) {
    this.pageNo.update(() => pageNo);
    this.queryService.pagination = {
      pageNo: this.pageNo(),
      pageSize: this.itemsPerPage(),
    };
  }

  isCartShow = signal(false);
  isCartOpen = signal(false);
  // isCartItemOpen = signal(false);
  clickCart() {
    this.isCartShow.set(false);
    this.isCartOpen.set(true);
    // this.isCartItemOpen.set(true);
  }

  isActiveTab: string = 'current';
  setActiveTab(tab: string): void {
    this.isActiveTab = tab;
  }

  clickCartCancel() {
    this.isCartShow.set(true);
    this.isCartOpen.set(false);
  }

  onAddedToPurchasedList($event: any) {
    this.isCartShow.set($event);
    // this.isCartShow.set(true);
  }

  purchaseListData = signal<PurchaseList | null>(null);

  getPurchaseListDataFromApplicantCard(data: PurchaseList) {
    this.purchaseListData.set(data);
  }

  handleBuyNow(): void {
    const numericListId = this.ApplicantCardService.purchaseListNumericId();
    console.log('numericListId:', numericListId);
    if (numericListId === null) {
      return;
    }

    const listId = numericListId.toString();
    const resumeIds =
      this.isActiveTab === 'total'
        ? ['-1']
        : this.ApplicantCardService.selectedApplicantIds();

    if (resumeIds.length === 0) {
      return;
    }

    this.submitPurchaseForm(resumeIds.join(','), listId);
  }

  private submitPurchaseForm(resumeIds: string, listId: string): void {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://corporate3.bdjobs.com/CV_Purchase_Payment_Confirm.asp';
    form.id = 'frmCartBuy';
    form.target = '_blank'; 

    const resumeIdInput = document.createElement('input');
    resumeIdInput.type = 'hidden';
    resumeIdInput.name = 'hidResumeId';
    resumeIdInput.id = 'hidResumeId';
    resumeIdInput.value = resumeIds;
    form.appendChild(resumeIdInput);

    const listIdInput = document.createElement('input');
    listIdInput.type = 'hidden';
    listIdInput.name = 'hidListId';
    listIdInput.id = 'hidListId';
    listIdInput.value = listId;
    form.appendChild(listIdInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    console.log('Resume IDs:', resumeIds);
    console.log('List ID:', listId);
  }
  sendUserActivity(){
    const activityType = 'Talent search'
    const activity = 1
    const activityName = ''
    this.bdJobsAnalyticsService.sendDeviceInfoToServer(activityType,activity,activityName)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe()
  }
}
