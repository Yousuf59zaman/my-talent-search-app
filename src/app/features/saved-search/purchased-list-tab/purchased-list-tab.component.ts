import { Component, DestroyRef, inject, Input, input, output, signal } from '@angular/core';
import { PurchasedListCardComponent } from "../purchased-list-card/purchased-list-card.component";
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { PurchasedListService } from '../services/purchased-list.service';
import { CompanyId} from '../../../shared/utils/app.const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchasedList } from '../model/purchased-list.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-purchased-list-tab',
  imports: [PurchasedListCardComponent],
  templateUrl: './purchased-list-tab.component.html',
  styleUrl: './purchased-list-tab.component.scss'
})
export class PurchasedListTabComponent {

  private LocalstorageService = inject(LocalstorageService)
  private PurchasedListService = inject(PurchasedListService)
  private destroyRef = inject(DestroyRef)
  companyId = this.LocalstorageService.getItem(CompanyId)
  purchasedListData: PurchasedList[] = []
  showButton = signal(false);
  isLoading = signal(true);
  @Input() showAllListData: boolean = false;
  changeActiveTab = output<string>();
  
  ngOnInit(){
    this.getPurchasedListData()
    window.addEventListener('scroll', () => {
      this.showButton.set(window.scrollY > 300);
    });
  }

  getPurchasedListData(){
    this.PurchasedListService.getPurchasedList(this.companyId)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    )
    .subscribe({
      next:(data) =>{
        this.purchasedListData = data as PurchasedList[]
      },
      error:(err) => {
        console.log('Error featching data', err)
      }
    })
  }
  onPurchasedListUpdated(){
    this.getPurchasedListData();
  }
  onPurchasedListDeleted() {
    this.getPurchasedListData();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showButton.set(false);
  }
}
