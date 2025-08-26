import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { SearchCardComponent } from "../search-card/search-card.component";
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyId } from '../../../shared/utils/app.const';
import { SavedFiltersService } from '../services/saved-filters.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SavedSearchCard } from '../model/saved-filters.model';

@Component({
  selector: 'app-saved-filters-tab',
  imports: [SearchCardComponent],
  templateUrl: './saved-filters-tab.component.html',
  styleUrl: './saved-filters-tab.component.scss'
})
export class SavedFiltersTabComponent implements OnInit{
  protected savedFilterService = inject(SavedFiltersService)
  protected LocalStorageService = inject(LocalstorageService)
  protected destroyRef = inject(DestroyRef)
  companyId = this.LocalStorageService.getItem(CompanyId)
  saveFilterList: SavedSearchCard[] = []
 
  constructor() {}

  ngOnInit(){
    this.getSavedFilterData()  
  }

  getSavedFilterData(){
    this.savedFilterService.getCVBankSavedFilter(this.companyId)
  .pipe(
    takeUntilDestroyed(this.destroyRef)
  )
  .subscribe({
    next:(data) => {
      if(data){
      this.saveFilterList = data as SavedSearchCard[]
      }
      
    },
    error:(err) => {
      console.log('Error featching data', err)
    }
  })
  } 

  onSaveFilterCardTitleUpdated() {
    this.getSavedFilterData(); 
  }

  onSaveFilterCardDeleted() {
    this.getSavedFilterData();
  }
}
