import { Component, DestroyRef, inject, Input, OnInit, output, signal } from '@angular/core';
import { SearchCardComponent } from "../search-card/search-card.component";
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyId } from '../../../shared/utils/app.const';
import { SavedFiltersService } from '../services/saved-filters.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SavedSearchCard } from '../model/saved-filters.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HomeQueryStore } from '../../../store/home-query.store';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-saved-filters-tab',
  imports: [SearchCardComponent],
  templateUrl: './saved-filters-tab.component.html',
  styleUrl: './saved-filters-tab.component.scss',
})
export class SavedFiltersTabComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly homeStore = inject(HomeQueryStore);
  protected savedFilterService = inject(SavedFiltersService);
  protected LocalStorageService = inject(LocalstorageService);
  protected destroyRef = inject(DestroyRef);
  companyId = this.LocalStorageService.getItem(CompanyId);
  saveFilterList: SavedSearchCard[] = [];
  changeActiveTab = output<string>();
  showButton = signal(false);
  isLoading = signal(true);
  @Input() showAllListData: boolean = false;

  ngOnInit() {
    this.getSavedFilterData();
    window.addEventListener('scroll', () => {
      this.showButton.set(window.scrollY > 300);
    });
  }

  getSavedFilterData() {
    this.savedFilterService
      .getCVBankSavedFilter(this.companyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.saveFilterList = data as SavedSearchCard[];
          }
        },
        error: (err) => {
          console.log('Error featching data', err);
        },
      });
  }

  onSaveFilterCardTitleUpdated() {
    this.getSavedFilterData();
  }

  onSaveFilterCardDeleted() {
    this.getSavedFilterData();
  }

  onCardClick($event: SavedSearchCard) {
    if (this.authService.isVerified()) {
      this.homeStore.setFilter({
        category: {
          type: 'saved',
          category: {
            id: $event.filterId as number,
            value: $event.groupId as number,
            categoryName: $event.title,
            filters: $event.filters,
          },
        },
      });
      if (this.router.url === '/cv-search') {
        this.changeActiveTab.emit('cv-search');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.router.navigate(['/cv-search']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showButton.set(false);
  }

  moveToSavedFiltersList() {
    this.router.navigate(['/cv-search'], {
      queryParams: { ref: 'saved-filters' },
    });
  }
}
