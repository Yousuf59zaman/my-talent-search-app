
import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef, OnChanges, output, Input, SimpleChanges, computed, OnInit } from '@angular/core';
import { VanueEditUpdateRequest, Venue } from '../../models/models';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomSelectService } from '../../services/custom-select.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyIdLocalStorage,UserId } from '../../enums/app.enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from "../input/input.component";
import { NgClass } from '@angular/common';
import { CircularLoaderService } from '../../../core/services/circularLoader/circular-loader.service';
import { ToastrService } from 'ngx-toastr';

enum InputTypeStype {
  normal = 'block w-full rounded-md border-0 py-1.5 pl-5 pr-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
  error = 'py-3 px-4 block w-full border-red-500 rounded-lg text-sm focus:border-red-500 focus:ring-red-500',
  success = 'py-3 px-4 block w-full border-teal-500 rounded-lg text-sm focus:border-teal-500 focus:ring-teal-500'
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [NgClass, InputComponent, ReactiveFormsModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomSelectComponent implements OnChanges, OnInit {

  private destroyRef = inject(DestroyRef);
  customSelectService = inject(CustomSelectService);
  localstorageService = inject(LocalstorageService);
  private loadrService = inject(CircularLoaderService);
  private toastrService = inject(ToastrService);

  showList = signal(false);
  showEditForm = signal(false);
  textAreaStyles = InputTypeStype;
  // nameErrorMsg = '';
  // addresserrorMsg = '';

  venueNameControl = computed(
    () => new FormControl(this.formData().venueName, {
      validators: [Validators.required],
      nonNullable: true
    }) as FormControl<string>
  );

  venueAddressControl = computed(
    ()=> new FormControl(this.formData().venueAddress,{
      validators:[ Validators.required],
      nonNullable: true
    }) as FormControl<string>
  );

  selectedItem = signal<Venue | null>(null);
  @Input() selectedVanueId!: number;

  selectedItemValue = output<Venue>();

  formData = signal({
    venueName: '',
    venueAddress: '',
    vanueId : 0
  });

  custmoSelectData = signal<Venue[]>([]);

  ngOnInit(){
    this.getSelectItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedVanueId']){
      this.patchData();
    }
  }

  patchData(){
    if(this.selectedVanueId){
      const foundItem = this.custmoSelectData().find((item: any) => {
        return item.venueID === this.selectedVanueId;
      });
      if(foundItem){
        this.selectedItem.update(() => foundItem as Venue);
      }
    }
  }
 private getSelectItems(){
    const companyID = this.localstorageService.getItem(CompanyIdLocalStorage)
    const userID = parseInt(this.localstorageService.getItem(UserId));

    this.customSelectService.getVenueData({companyID, userID })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (venue) => {
        this.custmoSelectData.update(() => venue.data as Venue[]);
        this.patchData();
      }
    })
  }

  addVanueItem(e: Event){
    e.stopPropagation();
    this.formData.set({venueName: '', venueAddress: '', vanueId: 0});
    this.showEditForm.update(() => true);
    this.showList.update((prev) => false);
  }

  editUpdateVanueData(): void{
    this.loadrService.setLoading(true);
    //if valid data
    if(this.venueAddressControl().value && this.venueNameControl().value){
      const payload: VanueEditUpdateRequest = {
        companyId: this.localstorageService.getItem(CompanyIdLocalStorage),
        userId :this.localstorageService.getItem(UserId),
        venueId: this.formData().vanueId,
        venueName: this.venueNameControl().value,
        venueAddress : this.venueAddressControl().value,
      }

      this.customSelectService.editUpdateVanueData(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.getSelectItems();
          this.showEditForm.update(() => false);
          this.showList.update((prev) => true);
          this.loadrService.setLoading(false);
          this.toastrService.success(
            'New Venue Added!',
            'Success'
          )
        }
      });
    }
    //invalid data
    else {
      this.venueAddressControl().setErrors({invalid: true, dirty: true})
      this.venueNameControl().setErrors({invalid: true, dirty: true})
      this.loadrService.setLoading(false);
      this.toastrService.error(
        'One or more field is empty!',
        'Failed'
      )
    }

    
  }

  toggleList(){
    this.showList.update((prev) => !prev);
    this.showEditForm.update(() => false);
  }

  selectItem(e: Event, item: Venue){
    this.selectedItem.update(() => item);
    this.showList.update((prev) => !prev);
    this.selectedItemValue.emit(item);
  }

  editItem(e: Event, item: Venue){
    e.stopPropagation();
    this.formData.set({venueName: item.venueName, venueAddress: item.venueAddress, vanueId: item.venueID});
    this.showEditForm.update(() => true);
    this.showList.update((prev) => !prev);
  }
  updateVenueName(value: string) {
    this.formData.set({ ...this.formData(), venueName: value });
  }
  updateVenueAddress(value: string) {
    this.formData.set({ ...this.formData(), venueAddress: value });
  }
  
  cancel(){
    this.showEditForm.update((prev) => !prev);
    this.showList.update((prev) => !prev);
  }
}
