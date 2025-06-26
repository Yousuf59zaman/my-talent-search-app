import { Component, computed, DestroyRef, ElementRef, EventEmitter, HostListener, inject, Output, signal, ViewChild, input } from '@angular/core';
import { EditPurchasedListInputRequestBody, PurchasedList } from '../model/purchased-list.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, mergeMap } from 'rxjs';
import { ConfirmationModalService } from '../../../core/services/confirmationModal/confirmation-modal.service';
import { PurchasedListService } from '../services/purchased-list.service';
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ResponseCode } from '../../../shared/enums/app.enums';

@Component({
  selector: 'app-purchased-list-card',
  imports: [InputComponent],
  templateUrl: './purchased-list-card.component.html',
  styleUrl: './purchased-list-card.component.scss'
})
export class PurchasedListCardComponent {
  readonly card = input.required<PurchasedList>();
  protected confirm =inject(ConfirmationModalService)
  protected destroyRef = inject(DestroyRef) 
  protected purchasedListService = inject(PurchasedListService)
  @Output() purchasedListUpdated = new EventEmitter<void>(); 
  @Output() purchasedListDeleted = new EventEmitter<void>();
  isPurchasedListEdit = signal(false)
  @ViewChild('editInput', { static: false }) editInput!: ElementRef;

  purchasedTitleControl = new FormControl('',[Validators.required, this.noLeadingOrOnlyWhitespaceValidator()]);
  purchasedDetailsControl = new FormControl('');

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
    const trimmedValue = this.purchasedTitleControl.value?.trim() || '';
    this.purchasedTitleControl.setValue(trimmedValue);

    if (this.purchasedTitleControl.invalid) {
      this.purchasedTitleControl.markAsTouched();
      return;
    }

    const reqBody: EditPurchasedListInputRequestBody = {
      id: this.card().id,
      CpId: this.card().companyId,
      PurchaseListName: this.purchasedTitleControl.value || '',
      PurchaseListDescription: this.purchasedDetailsControl.value || ''
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
        return this.purchasedListService.deletePurchasedList({ id: this.card().id });
      })
    ).subscribe({
      next: () => {
        this.purchasedListDeleted.emit()
      },
      error: (error) => {
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
  
}
