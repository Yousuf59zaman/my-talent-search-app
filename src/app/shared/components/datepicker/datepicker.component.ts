import { ChangeDetectionStrategy, Component, EventEmitter, OnChanges, Output, signal, SimpleChanges, input, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule, PickerType } from '@danielmoncada/angular-datetime-picker';

export enum MERIDIEUM {
  AM = "AM",
  PM = "PM"
}
@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule,
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class DatepickerComponent implements OnChanges {
  @Input() maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 365));

  readonly yearInMilliSec = 365 * 24 * 60 * 60 * 1000;
  readonly placeholder = input('Date Time');
  readonly label = input<string>('');
  readonly isRequired = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);
  readonly name = input('');
  readonly control = input<FormControl<string | null | Date>>(new FormControl());
  readonly pickerType = input<PickerType>('calendar');
  readonly inline = input<boolean>(false);
  readonly seperateTimer = input<boolean>(false);
  readonly hour12Timer = input<boolean>(false);
  readonly showDatePickerOnFocus = input<boolean>(false);
  readonly dateTimeString = input<string>('');
  readonly minDate = input<Date>(this.getLastMinuteOfDay());
  @Output() dateSelected = new EventEmitter<Date | null>(); 

  day = signal<number>(new Date().getDate());
  month = signal<number>(new Date().getMonth());
  year = signal<number>(new Date().getFullYear());
 
  dummyOwlCom: any;
  date!: Date;
  hour = signal<number>(1);
  miniute = signal<number>(0);
  amPm = signal<MERIDIEUM>(MERIDIEUM.AM);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateTimeString'] && changes['dateTimeString'].currentValue) {
      this.patchDate();
    }
  }

  private patchDate() {
    const date = new Date(this.dateTimeString());
    this.day.update(() => date.getDate());
    this.month.update(() => date.getMonth());
    this.year.update(() => date.getFullYear());
    this.hour.set(date.getHours());
    this.miniute.set(date.getMinutes());
    this.amPm.set(this.hour() >= 12 ? MERIDIEUM.PM : MERIDIEUM.AM);
    this.hour.set(this.hour() % 12 === 0 ? 12 : this.hour() % 12);
    this.updateDateControl();
  }

  onDateTimeChange(event: any) {
    const date = new Date(event.value);
    if (!this.control().value) {
      this.control().setValue(new Date());
      this.dateSelected.emit(date); 
    }
    this.day.update(() => date.getDate());
    this.month.update(() => date.getMonth());
    this.year.update(() => date.getFullYear());
    this.updateDateControl();
    
  }

  onHourChange(hour: number) {
    this.hour.update(() => hour);
    this.updateDateControl();
  }

  onMiniuteChange(miniute: number) {
    this.miniute.update(() => miniute);
    this.updateDateControl();
  }

  onAmPmChange(amPm: MERIDIEUM) {
    this.amPm.update(() => amPm);
    this.updateDateControl();
  }

  private updateDateControl() {
    const hour = isNaN(this.hour()) ? 0 : this.hour();
    const min = isNaN(this.miniute()) ? 0 : this.miniute();
    this.date = new Date(
      this.year(),
      this.month(),
      this.day(),
      this.amPm() === MERIDIEUM.PM && hour !== 12
        ? hour + 12
        : this.amPm() === MERIDIEUM.AM && hour === 12
        ? 0
        : hour,
      min,
      0,
      0
    );
    if (this.date > this.maxDate) {
      this.date = this.maxDate;  
    }
    this.control().setValue(this.date);
  }

  isDatePickerVisible = signal<boolean>(true); 

  closeDatePicker() {
    this.isDatePickerVisible.set(false);
  }

  openDatePicker() {
    this.isDatePickerVisible.set(true);
  }

  private getLastMinuteOfDay() {
    const endOfDay = new Date();
    endOfDay.setHours(0, 0, 0, 0);
    return endOfDay;
  }
}
