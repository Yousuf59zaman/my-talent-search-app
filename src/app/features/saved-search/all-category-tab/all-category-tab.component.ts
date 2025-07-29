import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AllCategoryCardComponent } from "../all-category-card/all-category-card.component";
import { CategoriesService } from '../services/categories.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Data } from '../model/allCategory.model';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyId } from '../../../shared/utils/app.const';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-all-category-tab',
  imports: [AllCategoryCardComponent],
  templateUrl: './all-category-tab.component.html',
  styleUrl: './all-category-tab.component.scss'
})
export class AllCategoryTabComponent {
  private AllCategoryService = inject(CategoriesService);
  private destroyRef = inject(DestroyRef);
  private localStorageService = inject(LocalstorageService);
  allCategory = signal<Data[]>([])
  showAllCategories = signal(false)
  isLoading = signal(true);
  ngOnInit(){
    this.getAllCategories();
  }
  
  getAllCategories(){
    this.AllCategoryService.getAllCategories(this.localStorageService.getItem(CompanyId))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          const sortData = data.sort((a,b) => a.categoryName.localeCompare(b.categoryName))
          this.allCategory.set(sortData)
        },
        error: (err) => {
          console.log('Error fetching data', err);
        }
      });
  }
}
