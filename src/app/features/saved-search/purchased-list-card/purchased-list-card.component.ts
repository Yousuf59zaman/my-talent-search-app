import { Component, computed, DestroyRef, ElementRef, EventEmitter, HostListener, inject, Output, signal, ViewChild, input, output } from '@angular/core';
import { EditPurchasedListInputRequestBody, PurchasedList } from '../model/purchased-list.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, mergeMap } from 'rxjs';
import { ConfirmationModalService } from '../../../core/services/confirmationModal/confirmation-modal.service';
import { PurchasedListService } from '../services/purchased-list.service';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ResponseCode, UserId } from '../../../shared/enums/app.enums';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HomeQueryStore } from '../../../store/home-query.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchased-list-card',
  imports: [InputComponent, ReactiveFormsModule],
  templateUrl: './purchased-list-card.component.html',
  styleUrl: './purchased-list-card.component.scss'
})
export class PurchasedListCardComponent {
  private localStorageService = inject(LocalstorageService);
  protected confirm =inject(ConfirmationModalService)
  protected destroyRef = inject(DestroyRef) 
  protected purchasedListService = inject(PurchasedListService)
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);
  private homeStore = inject(HomeQueryStore);
  private router = inject(Router);

  readonly card = input.required<PurchasedList>();
  changeActiveTab = output<string>();
  @Output() purchasedListUpdated = new EventEmitter<void>(); 
  @Output() purchasedListDeleted = new EventEmitter<void>();
  isPurchasedListEdit = signal(false)
  @ViewChild('editInput', { static: false }) editInput!: ElementRef;

  purchasedTitleControl = new FormControl('',[Validators.required, this.noLeadingOrOnlyWhitespaceValidator()]);
  purchasedDetailsControl = new FormControl('', [Validators.maxLength(250),Validators.pattern(/^[^'%"<>&()]*$/)])

  noLeadingOrOnlyWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value || '';
      return value.trim() === '' || /^\s/.test(value)
      ? { whitespace: true }
      : null;
    };
  }
  
  purchasedTitle = computed(
      () => {
        const card = this.card();
        if (card) {
          this.purchasedTitleControl.setValue(card.listName);
          return this.purchasedTitleControl.value;
        }
        return '';
      }
    )
  purchasedDetails = computed(
      () => {
        const card = this.card();
        if (card) {
          this.purchasedDetailsControl.setValue(card.listDescription);
          return this.purchasedDetailsControl.value;
        }
        return '';
      }
    )

  toggleShortlistedCvEditButton(){
    this.isPurchasedListEdit.set(!this.isPurchasedListEdit())
    }
  @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
      if (this.editInput && !this.editInput.nativeElement.contains(event.target)) {
        this.isPurchasedListEdit.set(false)
        if (this.card()) {
          this.purchasedTitleControl.setValue(this.card().listName);
          this.purchasedDetailsControl.setValue(this.card().listDescription ?? null)
        }
      }
    }

  editPurchasedListSubmit(){
    this.toggleShortlistedCvEditButton()
    const trimmedValue = this.purchasedTitleControl.value?.trim() || '';
    this.purchasedTitleControl.setValue(trimmedValue);
     const name = this.purchasedTitleControl.value || '';
    const description = this.purchasedDetailsControl.value || '';
    if (name.length > 45 || description.length > 250) {
      this.purchasedTitleControl.setErrors({ maxlength: true });
      this.purchasedDetailsControl.setErrors({ maxlength: true });
      return;
    }
    if (this.purchasedTitleControl.invalid && this.purchasedDetailsControl.invalid) {
      this.purchasedTitleControl.markAsTouched();
      return;
    }

    const reqBody: EditPurchasedListInputRequestBody = {
      cpId: this.card().companyId,
      purchaseListName: name,
      purchaseListDescription: description,
      purchaseListId:this.card().listId
    }
    this.purchasedListService
      .submitPurchasedListEdit(reqBody)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(res => res.responseCode === ResponseCode.success)
      ).subscribe({
        next: (res) => {
          this.purchasedListUpdated.emit()
        }
      })
  }

  protected purchasedListCvDelete(): void {
    this.confirm.openModal({
      isOpen: true,
      content: {
        isIconeClass:'icon-trash text-[#E02424] bg-[#FDF2F2] w-10 h-10 flex justify-center items-center rounded-full',
        content: 'Are you sure that you want to delete this?',
        closeButtonText: 'No',
        saveButtonText: 'Yes',
        isIcon: true,
        isCloseButtonVisible: true,
        isSaveButtonVisible: true
      }
    }).pipe(
      takeUntilDestroyed(this.destroyRef), 
      filter((response) => response?.event?.isConfirm === true),
      mergeMap(() => {
        return this.purchasedListService.deletePurchasedList({ 
          id: this.card().id,
          ListID:this.card().listId 
        });
      })
    ).subscribe({
      next: () => {
        this.purchasedListDeleted.emit()
        this.toastr.success('Purchased List delete successfuly', 'Success');
      },
      error: (error) => {
        this.toastr.error('error while deleting the Purchased List', 'Error');
        console.log('error while deleting the shortlisted cv', error);
        
      }
    });
  }
  onClickBuyAll() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://corporate3.bdjobs.com/CV_Purchase_Payment_Confirm.asp';
    form.name = 'frmBuyNow';
    form.id = 'frmBuyNow';
    form.style.display = 'none';
  
    const listIdInput = document.createElement('input');
    listIdInput.type = 'hidden';
    listIdInput.name = 'hidListId';
    listIdInput.id = 'hidListId';
    listIdInput.value = this.card().listId.toString();
    form.appendChild(listIdInput);
  
    const resumeIdInput = document.createElement('input');
    resumeIdInput.type = 'hidden';
    resumeIdInput.name = 'hidResumeId';
    resumeIdInput.id = 'hidResumeId';
    resumeIdInput.value = '-1';
    form.appendChild(resumeIdInput);
  
    document.body.appendChild(form);
    form.submit();
  }

  onClickPurchased(isAlreadyPurchased: boolean) {
    if (this.authService.isVerified()) {
      console.log('listId:', this.card().listId);
      console.log('listName:', this.card().listName);
      console.log('isAlreadyPurchased:', isAlreadyPurchased);
      this.homeStore.setFilter({
        category: {
          type: 'purchased',
          category: {
        id: this.card().listId as number,
        value: this.card().listId as number,
        categoryName: this.card().listName,
        filters: {
          ...this.card(),
          isAlreadyPurchased: isAlreadyPurchased,
        },
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
  
}
