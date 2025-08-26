import { Component, DestroyRef, inject } from '@angular/core';
import { SearchCardComponent } from "../search-card/search-card.component";
import { ShortlistedCvService } from '../services/shortlisted-cv.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyId } from '../../../shared/utils/app.const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SavedSearchCard} from '../model/saved-filters.model';

@Component({
  selector: 'app-shortlisted-cv-tab',
  imports: [SearchCardComponent],
  templateUrl: './shortlisted-cv-tab.component.html',
  styleUrl: './shortlisted-cv-tab.component.scss'
})
export class ShortlistedCvTabComponent {
  
  protected shortListedService =inject(ShortlistedCvService)
  protected destroyRef = inject(DestroyRef)
  protected LocalstorageService = inject (LocalstorageService)
  companyId = this.LocalstorageService.getItem(CompanyId)
  shortlistedCvList: SavedSearchCard[] = []

  
  
  constructor() {}

  ngOnInit(){
    this.getShortlistedCvData()
  }
  getShortlistedCvData(){
    this.shortListedService.getCvBankShortlist(this.companyId)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next:(data) =>{
        this.shortlistedCvList = data as SavedSearchCard[]
      },
      error:(err) => {
        console.log('Error featching data', err)
      }
    })
  }
  onShortlistedCvUpdated(){
    this.getShortlistedCvData();
  }
  onShortlistedCvDeleted() {
    this.getShortlistedCvData();
  }
}
