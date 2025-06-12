import { animate, query, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, signal, input, inject, DestroyRef } from '@angular/core';
import { CategoryByIdData, Data } from '../model/allCategory.model';
import { CommaNumberPipe } from "../../../shared/pipes/commaNumber.pipe";
import { HomeQueryStore } from '../../../store/home-query.store';
import { Router } from '@angular/router';
import { CategoriesService } from '../services/categories.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth/auth.service';


@Component({
  selector: 'app-all-category-card',
  imports: [NgClass, CommaNumberPipe],
  templateUrl: './all-category-card.component.html',
  styleUrl: './all-category-card.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        query(
          ':scope > *',
          [
            animate(
              '150ms ease-in',
              style({ opacity: 0, transform: 'scaleY(0.9)' })
            ),
          ],
          { optional: true }
        ),

        animate(
          '250ms ease-in',
          style({ height: '0', opacity: 0, overflow: 'hidden' })
        ),
      ]),
    ]),
  ],
})
export class AllCategoryCardComponent {
  private readonly homeStore = inject(HomeQueryStore);
  private readonly router = inject(Router);
  private AllCategoryService = inject(CategoriesService);
  private destroyRef = inject(DestroyRef);
  private localStorageService = inject(LocalstorageService);
  private authService = inject(AuthService);
  isExpand = signal(false);
  categoryData = input.required<Data>();
  categoryById = signal<CategoryByIdData | null>(null);

  redirectToCVBank(type: 'category' | 'recent' | 'immediate' | 'star', category: Data) {
    if (this.authService.isVerified()) {
      this.homeStore.setFilter({
        category: {
          type: type,
          category: category,
        }
      });

      this.router.navigate(['/cv-search'])
    }

  }

  getCategoryCountById(catId: string) {
    this.isExpand.set(!this.isExpand());
    if (!this.isExpand() || this.categoryById()) return;
    const CompanyId = this.localStorageService.getItem('CompanyId');
    const qLastUpdated = '-1'
    this.AllCategoryService.getCategoryCountById({ CompanyId, CatId: catId, qLastUpdated })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.categoryById.set(res);
        },
        error: (err) => {
          console.log('Error fetching data', err);
        }
      });

  }
}
