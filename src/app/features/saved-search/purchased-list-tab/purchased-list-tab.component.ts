import { Component, DestroyRef, inject, Input, output, signal } from '@angular/core';
import { PurchasedListCardComponent } from "../purchased-list-card/purchased-list-card.component";
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { PurchasedListService } from '../services/purchased-list.service';
import { CompanyId} from '../../../shared/utils/app.const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchasedList } from '../model/purchased-list.model';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { IsCorporateUser } from '../../../shared/enums/app.enums';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HomeQueryStore } from '../../../store/home-query.store';

@Component({
  selector: 'app-purchased-list-tab',
  imports: [PurchasedListCardComponent],
  templateUrl: './purchased-list-tab.component.html',
  styleUrl: './purchased-list-tab.component.scss'
})
export class PurchasedListTabComponent {
  private LocalstorageService = inject(LocalstorageService)
  private PurchasedListService = inject(PurchasedListService)
  private authService = inject(AuthService);
  private homeStore = inject(HomeQueryStore);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  companyId = this.LocalstorageService.getItem(CompanyId)
  purchasedListData: PurchasedList[] = []
  purchasedCV!: PurchasedList; 
  showButton = signal(false);
  isLoading = signal(true);
  IsCorporateUser = signal(false)
  @Input() showAllListData: boolean = false;
  changeActiveTab = output<string>();
  
  ngOnInit(){
    this.getPurchasedListData()
    window.addEventListener('scroll', () => {
      this.showButton.set(window.scrollY > 300);
    });
    const value = localStorage.getItem(IsCorporateUser);
    this.IsCorporateUser.set(value === 'true');
  }

  getPurchasedListData(){
    this.PurchasedListService.getPurchasedList(this.companyId)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    )
    .subscribe({
      next:(data) =>{
        const purchedLists = data as PurchasedList[];
        this.purchasedListData = purchedLists;
        this.purchasedCV = purchedLists.find(item => item.listName === 'defaultlist')!;
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

  moveToPurchaseList() {
    this.router.navigate(['/cv-search'], {
      queryParams: { ref: 'purchase-list' },
    });
  }

  onClickMyExpert(isAlreadyPurchased: boolean) {
    if (this.authService.isVerified()) {
      this.homeStore.setFilter({
        category: {
          type: 'purchased',
          category: {
        id: this.purchasedCV.listId as number,
        value: this.purchasedCV.listId as number,
        categoryName: this.purchasedCV.listName,
        filters: {
          ...this.purchasedCV,
          isAlreadyPurchased: isAlreadyPurchased,
        },
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
}
