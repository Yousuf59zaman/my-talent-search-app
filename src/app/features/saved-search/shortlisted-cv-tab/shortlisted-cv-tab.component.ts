import { Component, DestroyRef, inject, output, Input, signal } from '@angular/core';
import { SearchCardComponent } from "../search-card/search-card.component";
import { ShortlistedCvService } from '../services/shortlisted-cv.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyId } from '../../../shared/utils/app.const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SavedSearchCard} from '../model/saved-filters.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HomeQueryStore } from '../../../store/home-query.store';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-shortlisted-cv-tab',
  imports: [SearchCardComponent],
  templateUrl: './shortlisted-cv-tab.component.html',
  styleUrl: './shortlisted-cv-tab.component.scss',
})
export class ShortlistedCvTabComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly homeStore = inject(HomeQueryStore);
  protected shortListedService = inject(ShortlistedCvService);
  protected destroyRef = inject(DestroyRef);
  protected LocalstorageService = inject(LocalstorageService);
  companyId = this.LocalstorageService.getItem(CompanyId);
  shortlistedCvList: SavedSearchCard[] = [];
  showButton = signal(false);
  changeActiveTab = output<string>();
  isLoading = signal(true);
  @Input() showAllListData: boolean = false;

  ngOnInit() {
    this.getShortlistedCvData();
    window.addEventListener('scroll', () => {
      this.showButton.set(window.scrollY > 300);
    });
  }

  getShortlistedCvData() {
    this.shortListedService
      .getCvBankShortlist(this.companyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.shortlistedCvList = data as SavedSearchCard[];
        },
      });
  }

  onShortlistedCvUpdated() {
    this.getShortlistedCvData();
  }

  onShortlistedCvDeleted() {
    this.getShortlistedCvData();
  }

  onCardClick($event: SavedSearchCard) {
    if (this.authService.isVerified()) {
      this.homeStore.setFilter({
        category: {
          type: 'shortlisted',
          category: {
            id: $event.groupId as number,
            value: $event.groupId as number,
            categoryName: $event.title,
            filters: $event
          },
        },
      });
      if (this.router.url === '/cv-search') {
        this.changeActiveTab.emit('cv-search');
      } else {
        this.router.navigate(['/cv-search']);
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showButton.set(false);
  }
}
