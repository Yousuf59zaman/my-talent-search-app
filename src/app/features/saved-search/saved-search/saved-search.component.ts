import { Component, DestroyRef, inject, signal} from '@angular/core';
import { SavedFiltersTabComponent } from '../saved-filters-tab/saved-filters-tab.component';
import { ShortlistedCvTabComponent } from '../shortlisted-cv-tab/shortlisted-cv-tab.component';
import { PurchasedListTabComponent } from '../purchased-list-tab/purchased-list-tab.component';
import { AllCategoryTabComponent } from '../all-category-tab/all-category-tab.component';
import { NgComponentOutlet } from '@angular/common';
import { SavedFiltersService } from '../services/saved-filters.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompanyId } from '../../../shared/utils/app.const';

@Component({
  selector: 'app-saved-search',
  imports: [
  NgComponentOutlet
  ],
  templateUrl: './saved-search.component.html',
  styleUrl: './saved-search.component.scss'
})
export class SavedSearchComponent {
  protected savedFilterService = inject(SavedFiltersService)
  protected LocalStorageService = inject(LocalstorageService)
  protected destroyRef = inject(DestroyRef)
  companyId = this.LocalStorageService.getItem(CompanyId)

  tabs = [
    { name: 'All Category', component: AllCategoryTabComponent },
    { name: 'Saved Filters', component: SavedFiltersTabComponent },
    { name: 'Shortlisted CVs', component: ShortlistedCvTabComponent },
    { name: 'Purchase List', component: PurchasedListTabComponent },
    
  ];
  activeTab = signal(this.tabs[0]); 

  // ngOnInit(){
  //   this.getSavedFilterData()
  // }
  
  getSavedFilterData(){
    this.savedFilterService.getCVBankSavedFilter(this.companyId)
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next:(data) => {
        if(data){
          this.activeTab.set(data.length > 0 ? this.tabs[0] : this.tabs[3]);
        }
        
      },
      error:(err) => {
        console.log('Error featching data', err)
      }
    })
  } 
  setActiveTab(tab: { name: string; component: any }) {
    switch (tab.name) {
      case 'Saved Filters':
        window.location.href = 'https://corporate3.bdjobs.com/SaveFilter.asp?from=';
        break;
      
      case 'Shortlisted CVs':
        window.location.href = 'https://corporate3.bdjobs.com/ShortlistedCVs.asp?pgtype=wl&from=';
        break;
      
      case 'Purchase List':
        window.location.href = 'https://corporate3.bdjobs.com/PurchaseList.asp?from=recruiter';
        break;
      
      default:
        this.activeTab.set(tab);
        break;
    }
    
  }
}
