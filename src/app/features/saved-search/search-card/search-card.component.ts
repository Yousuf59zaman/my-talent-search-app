import { Component, computed, DestroyRef, ElementRef, HostListener, inject, signal, Signal, ViewChild, input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { EditSaveFilterInputRequestBody, EditShortlistedInputRequestBody, SavedSearchCard } from '../model/saved-filters.model';
import { InputComponent } from "../../../shared/components/input/input.component";
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { SavedFiltersService } from '../services/saved-filters.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, mergeMap } from 'rxjs';
import { ResponseCode } from '../../../shared/enums/app.enums';
import { ConfirmationModalService } from '../../../core/services/confirmationModal/confirmation-modal.service';
import { ShortlistedCvService } from '../services/shortlisted-cv.service';
import { ShortNumberPipe } from "../../../shared/pipes/shortNumber.pipe";
import { SavedSearchCardEnum } from '../enum/searchCard.enum';
@Component({
  selector: 'app-search-card',
  imports: [NgClass, InputComponent, ShortNumberPipe],
  templateUrl: './search-card.component.html',
  styleUrl: './search-card.component.scss'
})
export class SearchCardComponent {

  card = input.required<SavedSearchCard>();
  readonly tabName = input.required<string>();
  isSaveFilterEdit = signal(false)
  isShortlistedCvEdit = signal(false)
  expanded = signal(false);
  previewLength = 120;
  previewCount = 8
  private destroyRef = inject(DestroyRef)
  private savedFilterService = inject(SavedFiltersService)
  private shortlistedCvService = inject(ShortlistedCvService)
  protected confirm =inject(ConfirmationModalService)
  @Output() saveFilterCardTitleUpdated = new EventEmitter<void>(); 
  @Output() saveFilterCardDeleted = new EventEmitter<void>();
  @Output() shortlistedCvUpdated = new EventEmitter<void>(); 
  @Output() shortlistedCvCardDeleted = new EventEmitter<void>();

  savedFilterCardTitleControl = new FormControl('',[Validators.required,this.noLeadingOrOnlyWhitespaceValidator()])
  shortlistedCardTitleControl = new FormControl('',[Validators.required,this.noLeadingOrOnlyWhitespaceValidator()]);
  shortlistedCardDescriptionControl = new FormControl('');

  noLeadingOrOnlyWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value || '';
      return value.trim() === '' || /^\s/.test(value)
        ? { whitespace: true }
        : null;
    };
  }
  saveFilterCardTitle = computed(
    () => {
      const card = this.card();
      if (card) {
        this.savedFilterCardTitleControl.setValue(card.title);
        return this.savedFilterCardTitleControl.value;
      }
      return '';
    }
  )
  shortlistedCardTitle = computed(
    () => {
      const card = this.card();
      if (card) {
        this.shortlistedCardTitleControl.setValue(card.title);
        return this.shortlistedCardTitleControl.value;
      }
      return '';
    }
  )
  shortlistedCardDescription = computed(
    () => {
      const card = this.card();
      if (card) {
        this.shortlistedCardDescriptionControl.setValue(card.description ?? null);
        return this.shortlistedCardDescriptionControl.value;
      }
      return '';
    }
  )

  @ViewChild('editInput', { static: false }) editInput!: ElementRef;
  @ViewChild('editShortlistedInput', { static: false }) editShortlistedInput!: ElementRef;
  formatDate(isoDateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return new Date(isoDateString).toLocaleDateString('en-GB', options);
  }

  savedFiltersCategoryName: Signal<string[]> = computed(() => {
    const card = this.card();
    const excluded = ['InsType', 'qFilter', 'reqCount'];
  
    return card.filters
      ? Object.entries(card.filters)
          .map(([key]) =>
            SavedSearchCardEnum[key as keyof typeof SavedSearchCardEnum] as string || key
          )
          .filter(
            (value, index, self) =>
              self.indexOf(value) === index && !excluded.includes(value)
          )
      : [];
  });  
  visibleFilters = computed(() =>
    this.expanded() ? this.savedFiltersCategoryName() : this.savedFiltersCategoryName().slice(0, this.previewCount)
  );
  isLongList = computed(() => this.savedFiltersCategoryName().length > this.previewCount);

  toggleSaveFilterEditButton(){
    this.isSaveFilterEdit.set(!this.isSaveFilterEdit())
  }
  toggleShortlistedCvEditButton(){
    this.isShortlistedCvEdit.set(!this.isShortlistedCvEdit())
  }
  @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
      if (this.editInput && !this.editInput.nativeElement.contains(event.target)) {
        this.isSaveFilterEdit.set(false)
        if(this.card()){
          this.savedFilterCardTitleControl.setValue(this.card().title);
        }
      }
      if (this.editShortlistedInput && !this.editShortlistedInput.nativeElement.contains(event.target)) {
        this.isShortlistedCvEdit.set(false)
        if (this.card()) {
          this.shortlistedCardTitleControl.setValue(this.card().title);
          this.shortlistedCardDescriptionControl.setValue(this.card().description ?? null)
        }
      }
    }

  editSavedFilterSubmit() {
    const trimmedValue = this.savedFilterCardTitleControl.value?.trim() || '';
    this.savedFilterCardTitleControl.setValue(trimmedValue);
    
    if (this.savedFilterCardTitleControl.invalid) {
      this.savedFilterCardTitleControl.markAsTouched();
      return; 
    }
    
    const reqBody: EditSaveFilterInputRequestBody = {
      id: this.card().id,
      CpId: this.card().companyId,
      criteriaName: trimmedValue,
      IsInsert: 0
    };
    
    this.savedFilterService
      .submitSavedFilterName(reqBody)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(res => res.responseCode === ResponseCode.success)
      )
      .subscribe({
        next: () => {
          this.saveFilterCardTitleUpdated.emit();
        }
      });
  }

  protected savedFilterDelete(): void {
    this.confirm.openModal({
      isOpen: true,
      content: {
        isIconeClass: 'icon-trash text-[#E02424] bg-[#FDF2F2] w-10 h-10 flex justify-center items-center rounded-full',
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
      mergeMap(() => 
        this.savedFilterService.deleteSavedFilter({ id: this.card().id })
      )
    ).subscribe({
      next: () => {
        this.saveFilterCardDeleted.emit()
      },
      error: (error) => {
        console.log('error while deleting the saved filter', error);
        
      }
    });
  }
  editShortlistedSubmit(){
    const trimmedTitle = this.shortlistedCardTitleControl.value?.trim() || '';
    this.shortlistedCardTitleControl.setValue(trimmedTitle)

    if(this.shortlistedCardTitleControl.invalid){
      this.shortlistedCardTitleControl.markAsTouched()
      return
    }

    const reqBody:EditShortlistedInputRequestBody = {
      id:this.card().id,
      CpId:this.card().companyId,
      categoryName:this.shortlistedCardTitleControl.value || '',
      categoryDescription:this.shortlistedCardDescriptionControl.value || '',
      IsInsert:0
    }
    this.shortlistedCvService
    .submitShortlistedEdit(reqBody)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(res => res.responseCode === ResponseCode.success)
    ).subscribe({
        next:(res) =>{
          this.shortlistedCvUpdated.emit()
        }
      })
  }
  
  protected shortlistedCvDelete(): void {
    this.confirm.openModal({
      isOpen: true,
      content: {
        isIconeClass: 'icon-trash text-[#E02424] bg-[#FDF2F2] w-10 h-10 flex justify-center items-center rounded-full',
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
      mergeMap(() => 
        this.shortlistedCvService.deleteShortlistedCv({ id: this.card().id })
      )
    ).subscribe({
      next: () => {
        this.shortlistedCvCardDeleted.emit()
      },
      error: (error) => {
        console.log('error while deleting the shortlisted cv', error);
        
      }
    });
  }
  toggleExpand() {
    this.expanded.set(!this.expanded());
  }
  isLongText = computed(() => {
    const description = this.shortlistedCardDescription();
    return description ? description.length > this.previewLength : false;
  });
}
