import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
  input,
  model,
  computed,
  inject
} from '@angular/core';
import { MultiSelectQueryEvent, SelectItem } from '../../models/models';
import { FormControl, FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { InputComponent } from "../input/input.component";
import { NumericOnlyDirective } from '../../../core/directives/numeric-only.dir';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [FormsModule, NgClass, TruncatePipe, NumericOnlyDirective],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectComponent implements OnInit, OnChanges, OnDestroy {
  private toastr = inject(ToastrService);
  readonly searchLabel = input('');
  suggestions = model<SelectItem[]>([]);
  readonly isFullWidth = input(false);
  readonly overLayVisibleOnlyOnFocus = input(false);
  readonly overLayVisibleOnlyOnSuggestions = input(false);
  readonly dbncTime = input(300);
  readonly multiplSelection = input(true);
  readonly maxSelection = input(0);
  readonly resetOnSelection = input(false);
  readonly checkBoxVisible = input(true);
  readonly control = input(new FormControl<SelectItem[]>([]));
  readonly isSearchBox = input(true);
  readonly isRenderSelectedItem = input(false); // Show selected item in the input box
  readonly patchInputValue = input('');
  readonly isflotable = input(false);
  readonly placeholderText = input('');
  readonly isBindSelectedItemsOnly = input(false);
  readonly isRadioAsSelectionType = input(false);
  readonly isShowSelectedItemsAsChip = input(false);
  readonly isExtraParamInChip = input(false);
  readonly chipLabelCharacterCount = input(10);
  @Output() searchQuery: EventEmitter<MultiSelectQueryEvent> =
    new EventEmitter<MultiSelectQueryEvent>();
  @Output() onSelect: EventEmitter<SelectItem[]> = new EventEmitter<
    SelectItem[]
  >();

  searchQueryInput = signal<string>('');
  isOverLayVisible = signal(false);

  isDestroyed$ = new Subject<boolean>();

  @ViewChild('parentDivRef') parentDivRef: ElementRef | null = null;
  isTriggeredfromSelection = false;

  constructor() {
    const inputStream$ = toObservable(this.searchQueryInput);

    inputStream$
      .pipe(
        tap((str) => {
          if (!this.isBindSelectedItemsOnly()) {
            this.control().setValue(str as any);
          }
        }),
        distinctUntilChanged(),
        debounceTime(this.dbncTime()),
        map((str) => (this.isTriggeredfromSelection ? null : str)),
        tap(() => (this.isTriggeredfromSelection = false)),
        filter((str) => str !== null),
        takeUntil(this.isDestroyed$)
      )
      .subscribe({
        next: (query) => {
          this.searchQuery.emit({ query });
          this.isTriggeredfromSelection = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.isDestroyed$.next(true);
    this.isDestroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['suggestions']?.currentValue) {
      if (this.isRadioAsSelectionType()) {
        const currentValue = this.control()?.value;
        if (currentValue && currentValue.length > 0) {
          const selectedValue = currentValue[0]?.value;

          this.suggestions.update((suggestions) =>
            suggestions.map((item) => ({
              ...item,
              isSelected: item.value === selectedValue
            }))
          );
        }
      }
      if (!changes?.['suggestions'].isFirstChange()) {
        this.showOverLay();
      }
    }

    if (
      changes?.['patchInputValue'] &&
      changes?.['patchInputValue'].currentValue &&
      this.isRenderSelectedItem()
    ) {
      this.handleSelectedItemShowOnInput(this.patchInputValue());
    }
  }

  private handleSelectedItemShowOnInput(query: string) {
    this.isTriggeredfromSelection = true;
    this.searchQueryInput.update(() => query);
    setTimeout(() => {
      this.isOverLayVisible.update(() => false);
    }, 0);
  }

  ngOnInit(): void {
    this.showOverLay();
    const control = this.control();
    if (control) {
      control.valueChanges
        .pipe(takeUntil(this.isDestroyed$))
        .subscribe((val: SelectItem[] | null) => {
          if (!val || val.length === 0) {
            this.suggestions.update((items) =>
              items.map((item) => ({ ...item, isSelected: false }))
            );
          } 
        });
    }
  }

  showOverLay() {
    if (
      this.getOverLayVisibleOnlyOnSuggestions() &&
      !this.suggestions()?.length &&
      !this.searchQueryInput().trim()
    ) {
      this.setIsOverLayVisible(false);
      return;
    }

    if (this.isOverLayVisible() || this.overLayVisibleOnlyOnFocus()) {
      return;
    }

    this.setIsOverLayVisible(true);
  }

  // use only when overLayVisibleOnlyOnFocus = true
  hideOverLay() {
    this.setIsOverLayVisible(false);
  }

  setIsOverLayVisible(value: boolean) {
    this.isOverLayVisible.set(value);
  }

  onSearchInputFocus() {
    if (this.isOverLayVisible()) {
      return;
    }

    if (this.isSuggestionsAvailable(this.suggestions())) {
      this.setIsOverLayVisible(true);
    }
  }

  onSearchInputBlur() { }

  isSuggestionsAvailable(suggestions: SelectItem[]): boolean {
    return !!suggestions?.length;
  }

  getOverLayVisibleOnlyOnFocus(): boolean {
    return this.overLayVisibleOnlyOnFocus();
  }

  getOverLayVisibleOnlyOnSuggestions(): boolean {
    return this.overLayVisibleOnlyOnSuggestions();
  }

  // use only when overLayVisibleOnlyOnFocus = true
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.getOverLayVisibleOnlyOnFocus()) {
      return;
    }
    const source = event.target;

    if (
      this.parentDivRef?.nativeElement &&
      !this.parentDivRef.nativeElement.contains(source)
    ) {
      this.hideOverLay();
    }
  }

  toggleSelection(item: SelectItem) {
    if (this.maxSelection() && this.maxSelection() === this.control().value?.length) {
      this.showMaxSelectionValidationText()
    }
    const isRenderSelectedItem = this.isRenderSelectedItem();
    const multiplSelection = this.multiplSelection();
    if (item && !multiplSelection && isRenderSelectedItem) {
      this.onSelect.emit([item]);
      if (isRenderSelectedItem) {
        this.handleSelectedItemShowOnInput(item.label);
      }
      return;
    }

    if (this.isRadioAsSelectionType() && !this.multiplSelection()) {
      this.suggestions.update((prev) =>
        prev.map((s) =>
          s.value === item.value
            ? { ...s, isSelected: true }
            : { ...s, isSelected: false }
        )
      );
      item.isSelected = true;
      const control = this.control();
      if (control) {
        control.setValue([item]);
      }
      return;
    } else {
      item.isSelected = !item.isSelected;
    }
    const selectedItems: SelectItem[] = [...(this.control()?.value || [])];
    if (item.isSelected) {
      const maxSelection = this.maxSelection();
      if (maxSelection && selectedItems.length === maxSelection) {
        item.isSelected = false;
        return;
      }
      selectedItems.push(item);
    } else {
      const itemIndex = selectedItems.findIndex(
        (selectedItem) => selectedItem.value === item.value
      );
      if (itemIndex > -1) {
        selectedItems.splice(itemIndex, 1);
      }
    }

    const control = this.control();
    if (control) {
      control.setValue(selectedItems);
    }

    if (!multiplSelection && this.resetOnSelection()) {
      this.searchQueryInput.set('');
      this.suggestions.set([]);
      this.setIsOverLayVisible(false);
    }

    this.onSelect.emit(selectedItems);
  }

  // TODO: following not working, make it work later
  handleKeypress(event: KeyboardEvent, item: any) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); // Prevent the default action to avoid scrolling
      this.toggleSelection(item);
    }
  }

  removeChip(val: any) {
    const control = this.control();
    const selectedItems = [...(control?.value || [])];
    const itemIndex = selectedItems.findIndex(
      (selectedItem) => selectedItem.value === val
    );
    if (itemIndex > -1) {
      selectedItems.splice(itemIndex, 1);
    }
    control.setValue(selectedItems);
    this.onSelect.emit(selectedItems);
  }

  onChangeExtraParam(selectedItem: SelectItem) {
    const control = this.control();
    const selectedItems = [...(control?.value || [])];
    const itemIndex = selectedItems.findIndex(
      (item) => item.value === selectedItem.value
    );
    selectedItems[itemIndex] = { ...selectedItem };
    control.setValue(selectedItems);
  }
  showMaxSelectionValidationText() {
    switch (this.placeholderText()) {
      case 'Write skills':
        this.toastr.warning('You can add maximum 7 skills.');
        break;
      case 'Select industries':
        this.toastr.warning('You can add maximum 5 industries.');
        break;
      case 'Write Expertise':
        this.toastr.warning('You can add maximum 3 areas of expertise.');
        break;
      case 'Select institute':
        this.toastr.warning('You can add maximum 5 institutes.');
        break;
      case 'Select a location':
        this.toastr.warning('You can add maximum 5 locations.');
        break;

      default:
        break;
    }
  }

  isAlreadySelected(item: SelectItem): boolean {
    if (this.isRadioAsSelectionType()) return false;
    const selectedItems = this.control()?.value || [];
    return selectedItems.find(
      (selectedItem) => selectedItem.label.toLowerCase() === item.label.toLowerCase()
    ) !== undefined;
  }
}