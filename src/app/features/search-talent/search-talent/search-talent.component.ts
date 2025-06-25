import { Component, computed, DestroyRef, ElementRef, HostListener, inject, signal, ViewChild, OnInit, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectQueryEvent, SelectItem } from '../../../shared/models/models';
import { RangeSliderComponent } from "../../../shared/components/range-slider/range-slider.component";
import { MultiSelectComponent } from "../../../shared/components/multi-select/multi-select.component";
import { combineLatest, debounce, debounceTime, filter, map, Observable, of, scan, skipWhile, startWith, Subject, switchMap, tap, timer } from 'rxjs';
import { SearchTalentService } from '../services/search-talent.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EduSubject, IndustryType, ISearchCountForm, SearchHistory } from '../model/search-talent.models';
import { CountQueryService } from '../services/count-query.service';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CommaNumberPipe } from "../../../shared/pipes/commaNumber.pipe";
import { Router } from '@angular/router';
import { HomeQueryStore } from '../../../store/home-query.store';
import { IsCorporateUser } from '../../../shared/enums/app.enums';
import { isDefaultRange } from '../../filter-panel/utility/functions';
import { AuthService } from '../../../core/services/auth/auth.service';
import { MultiSelectType } from '../../filter-panel/filter-panel.component';
import { InstituteResponse } from '../../filter-panel/models/filter-datamodel';
import { FilterDataService } from '../../filter-panel/services/filter-data.service';

export const DefaultAge = [20, 50];
export const DefaultSalary = [10000, 300000];
export const DefaultExpRange = [0, 20];

export const MaxAgeRange = [18,65];
export const MaxSalaryRange = [10000, 300000];
export const MaxExpRange = [0, 50];
type TriggeredBy = 'Age' | 'Keywords' | 'EduInstitute' | 'EduSubject' | 'Salary' | 'Experience' | 'IndustryType' | '';

@Component({
  selector: 'app-search-talent',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    RangeSliderComponent,
    MultiSelectComponent,
    TruncatePipe,
    CommaNumberPipe
],
  templateUrl: './search-talent.component.html',
  styleUrl: './search-talent.component.scss',
  providers: [CountQueryService,FilterDataService],
})
export class SearchTalentComponent implements OnInit {
  showHistory = signal(false);
  isAgePopoverOpen = signal(false);
  isGenderPopoverOpen = signal(false);
  isEduInstitutePopoverOpen = signal(false);
  isEduSubjectPopoverOpen = signal(false);
  isSalaryPopoverOpen = signal(false);
  isExperiencePopoverOpen = signal(false);
  isIndustryTypePopoverOpen = signal(false);
  private destroyRef = inject(DestroyRef);
  private searchTalentService = inject(SearchTalentService);
  private homeQueryStore = inject(HomeQueryStore);
  private authService = inject(AuthService);
  private filterDataService = inject(FilterDataService);
  eduInstituteData: SelectItem[] = [];
  filteredInstituteSuggestions = signal<SelectItem[]>([]);
  private instituteQueried$ = new Subject<MultiSelectQueryEvent>();
  eduInstituteSuggestions: SelectItem[] = [];
  eduSubjectData: SelectItem[] = [];
  eduSubjectSuggestions: SelectItem[] = [];
  rawHistory: any[] = [];
  industryTypeData: SelectItem[] = [];
  industryTypeSuggestions: SelectItem[] = [];
  totalCount = signal(0);
  triggeredBy = signal<TriggeredBy[]>([]);
  displayCount = signal(0);
  isCrunching = signal(true);
  IsCorporateUser = signal(false);
  multiSelectType = MultiSelectType;
  ageRangeOptions = signal({floor: DefaultAge[0], ceil:DefaultAge[1], hidePointerLabels: true, hideLimitLabels: true});
  expRangeOptions = signal({floor: DefaultExpRange[0], ceil: DefaultExpRange[1], hidePointerLabels: true, hideLimitLabels: true});
  salaryRangeOptions = signal({floor: DefaultSalary[0], ceil: DefaultSalary[1], hidePointerLabels: true, hideLimitLabels: true});
  genderLevels: SelectItem[] = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
  ];

private lastCount = 0;

constructor() {
  effect(() => {
    const count = this.totalCount();
    if (count !== this.lastCount) {
      this.animateCount();
      this.lastCount = count;
    }
  });
}

  searchHistory = signal<SearchHistory[]>([]);
  defaultAge = DefaultAge;
  defaultSalary = DefaultSalary;
  defaultExpRange = DefaultExpRange;
  isClearingFilter = false;

  searchTalentForm = new FormGroup({
    keyWords: new FormControl<string | null>(null),
    age: new FormControl<number[] | null>(DefaultAge),
    eduInstitute: new FormControl<SelectItem[] | null>(null),
    eduSubject: new FormControl<SelectItem[] | null>(null),
    salary: new FormControl<number[] | null>(DefaultSalary),
    expRange: new FormControl<number[] | null>(DefaultExpRange),
    industryType: new FormControl<SelectItem[] | null>(null),
  });

  controlKeyWords = computed(
    () => this.searchTalentForm.get('keyWords') as FormControl
  );
  controlAgeRange = computed(
    () =>
      this.searchTalentForm.get('age') as FormControl as any as FormControl<
        number[]
      >
  );
  controlEduInstitute = computed(
    () => this.searchTalentForm.get('eduInstitute') as FormControl<SelectItem[] | null>
  );
  controlEduSubject = computed(
    () => this.searchTalentForm.get('eduSubject') as FormControl<SelectItem[] | null>
  );
  controlSalaryRange = computed(
    () =>
      this.searchTalentForm.get('salary') as FormControl as any as FormControl<
        number[]
      >
  );
  controlExpRange = computed(
    () =>
      this.searchTalentForm.get(
        'expRange'
      ) as FormControl as any as FormControl<number[]>
  );
  controlIndustryType = computed(
    () => this.searchTalentForm.get('industryType') as FormControl<SelectItem[] | null>
  );

  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  @ViewChild('age', { static: false }) age!: ElementRef;
  @ViewChild('gender', { static: false }) gender!: ElementRef;
  @ViewChild('eduInstitute', { static: false }) eduInstitute!: ElementRef;
  @ViewChild('eduSubject', { static: false }) eduSubject!: ElementRef;
  @ViewChild('salary', { static: false }) salary!: ElementRef;
  @ViewChild('experience', { static: false }) experience!: ElementRef;
  @ViewChild('industryType', { static: false }) industryType!: ElementRef;

  countQueryService = inject(CountQueryService);
  storageService = inject(LocalstorageService);
  private router = inject(Router);

  ngOnInit() {
    const value = localStorage.getItem(IsCorporateUser);
    this.IsCorporateUser.set(value === 'true');
    this.getHistory();
    this.getIndustryType();
    this.getEduSubject();
    this.listenOnFormChanges();
    this.showDefaultCount();
    this.listenOnInstituteQuery
  }

  togglePopover(
    type:
      | 'age'
      | 'gender'
      | 'eduInstitute'
      | 'eduSubject'
      | 'salary'
      | 'experience'
      | 'industryType'
  ) {
    const popovers = {
      age: this.isAgePopoverOpen,
      gender: this.isGenderPopoverOpen,
      eduInstitute: this.isEduInstitutePopoverOpen,
      eduSubject: this.isEduSubjectPopoverOpen,
      salary: this.isSalaryPopoverOpen,
      experience: this.isExperiencePopoverOpen,
      industryType: this.isIndustryTypePopoverOpen,
    };
    const isCurrentlyOpen = popovers[type]();
    Object.values(popovers).forEach((signal) => signal.set(false));
    popovers[type].set(!isCurrentlyOpen);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.searchInput &&
      !this.searchInput.nativeElement.contains(event.target)
    ) {
      this.showHistory.set(false);
    }
    if (this.age && !this.age.nativeElement.contains(event.target)) {
      this.isAgePopoverOpen.set(false);
    }
    if (this.gender && !this.gender.nativeElement.contains(event.target)) {
      this.isGenderPopoverOpen.set(false);
    }
    if (
      this.eduInstitute &&
      !this.eduInstitute.nativeElement.contains(event.target)
    ) {
      this.isEduInstitutePopoverOpen.set(false);
    }
    if (
      this.eduSubject &&
      !this.eduSubject.nativeElement.contains(event.target)
    ) {
      this.isEduSubjectPopoverOpen.set(false);
    }
    if (this.salary && !this.salary.nativeElement.contains(event.target)) {
      this.isSalaryPopoverOpen.set(false);
    }
    if (
      this.experience &&
      !this.experience.nativeElement.contains(event.target)
    ) {
      this.isExperiencePopoverOpen.set(false);
    }
    if (
      this.industryType &&
      !this.industryType.nativeElement.contains(event.target)
    ) {
      this.isIndustryTypePopoverOpen.set(false);
    }
  }

  submitForm(event: Event) {
    event.preventDefault();
    if(!this.authService.isVerified()){
      return;
    }
    let formData: any = this.searchTalentForm.value;
    if (!this.isSearchEmpty(formData)) {
      formData['lastUpdated'] = new Date().toISOString();
      const basicCvQuery = this.storageService.getItem('basicCvQuery');
      if (basicCvQuery) {
        let history: any[] = JSON.parse(basicCvQuery);
        if (history && history.length < 3) {
          history = [formData, ...history];
        } else if (history && history.length === 3) {
          history = [formData, ...history.slice(0, 2)];
        }
        this.storageService.setItem('basicCvQuery', JSON.stringify(history));
      } else {
        this.storageService.setItem('basicCvQuery', JSON.stringify([formData]));
      }
    }
    // this.searchTalentQueryParams();
    this.homeQueryStore.setFilter(formData);
    this.router.navigate(['/cv-search']);
  }

  private isSearchEmpty(data: any): boolean {
      const isEmpty = !data.keyWords &&
      (!data.eduInstitute || data.eduInstitute.length === 0) &&
      (!data.eduSubject || data.eduSubject.length === 0) &&
      (!data.industryType || data.industryType.length === 0) &&
      isDefaultRange(data.age, DefaultAge) &&
      isDefaultRange(data.expRange, DefaultExpRange) &&
      isDefaultRange(data.salary, DefaultSalary);

    return isEmpty;
  }

  private getHistory() {
    const basicCvQuery = this.storageService.getItem('basicCvQuery');
    if (basicCvQuery) {
      const history = JSON.parse(basicCvQuery);
      this.rawHistory = history
      const searchHistory = this.rawHistory.map((data: any) => {
        return {
          keywords: data.keyWords,
          filters: this.getAllFilters(data),
          lastUpdated: data.lastUpdated,
        };
      }
      );
      this.searchHistory.set(searchHistory);
    }
  }

  applySearchHistory(index: any) {

    const rawData = this.rawHistory[index]
  
    if (!rawData) return;
    
    this.triggeredBy.set([])
    if (rawData.keyWords) {
      this.controlKeyWords().setValue(rawData.keyWords);
    }else{
      this.controlKeyWords().setValue('', {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Keywords'));  
    }
  
    if (rawData.age && (rawData.age[0] !== DefaultAge[0] || rawData.age[1] !== DefaultAge[1])) {
      this.controlAgeRange().setValue(rawData.age);
    } else{
      this.controlAgeRange().setValue(DefaultAge, {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Age'));
    }

    if (rawData.expRange && (rawData.expRange[0] !== DefaultExpRange[0] || rawData.expRange[1] !== DefaultExpRange[1])) {
      this.controlExpRange().setValue(rawData.expRange);
    } else {
      this.controlExpRange().setValue(DefaultExpRange, {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Experience'));
    }
  
    if (rawData.eduInstitute) {
      this.controlEduInstitute().setValue(rawData.eduInstitute);
    } else {
      this.controlEduInstitute().setValue(null, {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'EduInstitute'));
    }
  
    if (rawData.eduSubject) {
      this.controlEduSubject().setValue(rawData.eduSubject);
    } else {
      this.controlEduSubject().setValue(null, {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'EduSubject'));
    }
  
    if (rawData.industryType) {
      this.controlIndustryType().setValue(rawData.industryType);
    } else {
      this.controlIndustryType().setValue(null, {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'IndustryType'));
    }
    if (rawData.salary && (rawData.salary[0] !== DefaultSalary[0] || rawData.salary[1] !== DefaultSalary[1])) {
      this.controlSalaryRange().setValue(rawData.salary);
    } else {
      this.controlSalaryRange().setValue(DefaultSalary, {emitEvent: true});
      this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Salary'));
    }
  }
  
  private getAllFilters(data: any) {
    let filters = '';
    if (data.age[0] !== DefaultAge[0] || data.age[1] !== DefaultAge[1]) {
      filters += `Age: ${data.age[0]}-${data.age[1]}, `;
    }
    if (data.expRange[0] !== DefaultExpRange[0] || data.expRange[1] !== DefaultExpRange[1]) {
      filters += `Experience: ${data.expRange[0]}-${data.expRange[1]}, `;
    }
    if (data.eduInstitute) {
      filters += `Education Institute: ${data.eduInstitute[0].label}, `;
    }
    if (data.eduSubject) {
      filters += `Education Subject: ${data.eduSubject[0].label}, `;
    }
    if (data.salary[0] !== DefaultSalary[0] || data.salary[1] !== DefaultSalary[1]) {
      filters += `Salary: ${data.salary[0]}-${data.salary[1]}, `;
    }
    if (data.industryType) {
      filters += `Industry Type: ${data.industryType[0].label}, `;
    }
    return filters;
  }

  clearHistory(index: number) {
    this.searchHistory.set(this.searchHistory().filter((_, i) => i !== index));
    setTimeout(() => {
      this.showHistory.set(true);
    }, 0);

    const history = this.storageService.getItem('basicCvQuery');
    if (history) {
      const historyArr = JSON.parse(history);
      historyArr.splice(index, 1);
      this.storageService.setItem('basicCvQuery', JSON.stringify(historyArr));
    }
  }

  onTyping() {
    this.showHistory.set(false);
  }

  onEducationInstituteQueryInput($event: MultiSelectQueryEvent) {
    this.eduInstituteSuggestions = $event?.query.trim()
      ? this.eduInstituteData.filter((inst) =>
          inst.label
            .toLocaleLowerCase()
            .includes($event.query.toLocaleLowerCase())
        )
      : this.eduInstituteData;
  }
  private listenOnInstituteQuery = this.instituteQueried$
    .pipe(
      switchMap((event) => this.getInstitutesObservable(event)),
      map(response => {
        if (!response?.data) {
          return [];
        }


        return response.data.map((item: InstituteResponse) => ({
          label: item.instituteName,
          value: item.instituteId,
          selectId: this.getTimeBasedIdForSelect(item.instituteId)
        }));
      })
    )
    .subscribe((instituteSelectItems) => {
      this.setInstituteSuggestions(instituteSelectItems);
    });

  setInstituteSuggestions(instituteSelectItems: SelectItem[]) {
    this.filteredInstituteSuggestions.set(instituteSelectItems);
  }
  
  getInstitutesObservable(event: MultiSelectQueryEvent): Observable<any> {
    if (!event?.query?.trim()) {
      return of(null);
    }

    return this.filterDataService.getInstitutes({ InstituteName: event?.query });
  }
  private getTimeBasedIdForSelect(value: number) {
    return (value || '') + '_' + Date.now();
  }

  private getEduSubject() {
    this.searchTalentService
      .getEduSubjectSuggestions()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((data: EduSubject[]) =>
          data.map((eduSubject) => ({
            label: eduSubject.displayName,
            value: eduSubject.displayName,
            mainObj: eduSubject,
          }))
        )
      )
      .subscribe({
        next: (eduSubjectSelectItems: SelectItem[]) =>
          this.setEduSubjectSuggestions(eduSubjectSelectItems),
      });
  }

  onEduSubjectQueryInput($event: MultiSelectQueryEvent) {
    this.eduSubjectSuggestions = $event?.query.trim()
      ? this.eduSubjectData.filter((inst) =>
          inst.label
            .toLocaleLowerCase()
            .includes($event.query.toLocaleLowerCase())
        )
      : this.eduSubjectData;
  }

  private setEduSubjectSuggestions(eduSubjectSelectItems: SelectItem[]) {
    this.eduSubjectData = this.eduSubjectSuggestions = eduSubjectSelectItems;
  }

  private getIndustryType() {
    this.searchTalentService
      .getIndustryTypeSuggestions()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((data: IndustryType[]) =>
          data.map((industryType) => ({
            label: industryType.displayName,
            value: industryType.displayName,
            mainObj: industryType,
          }))
        )
      )
      .subscribe({
        next: (industryTypeSelectItems: SelectItem[]) =>
          this.setIndustyTypeSuggestions(industryTypeSelectItems),
      });
  }

  onIndustryTypeQueryInput($event: MultiSelectQueryEvent) {
    this.industryTypeSuggestions = $event?.query.trim()
      ? this.industryTypeData.filter((inst) =>
          inst.label.toLowerCase().includes($event.query.toLowerCase())
        )
      : this.industryTypeData;
  }

  private setIndustyTypeSuggestions(industryTypeSelectItems: SelectItem[]) {
    this.industryTypeData = this.industryTypeSuggestions =
      industryTypeSelectItems;
  }

  private getControllerNameByIndex(index: number, formDataArr: any[]): TriggeredBy {
    switch (index) {
      case 0:
        if (formDataArr[0][0] !== DefaultAge[0] || formDataArr[0][1] !== DefaultAge[1]) {
          return 'Age';
        }
        return '';
      case 1:
        return 'Keywords';
      case 2:
        if (formDataArr[2][0] !== DefaultExpRange[0] || formDataArr[2][1] !== DefaultExpRange[1]) {
          return 'Experience';
        }
        return '';
      case 3:
        if (formDataArr[3] !== '') {
          return 'EduInstitute';
        }
        return '';
      case 4:
        if (formDataArr[4] !== '') {
          return 'EduSubject';
        }
        return '';
      case 5:
        if (formDataArr[5][0] !== DefaultSalary[0] || formDataArr[5][1] !== DefaultSalary[1]) {
          return 'Salary';
        }
        return '';
      case 6:
        if (formDataArr[6] !== '') {
          return 'IndustryType';
        }
        return '';
    }

    return '';
  }

  private listenOnFormChanges() {
    let delayAgeInMs = 4000, delayExpInMs = 4000, delaySalaryInMs = 4000;
    const controls = this.searchTalentForm.controls;
    const formControlsObs$ = [
      controls.age.valueChanges.pipe(
        startWith(null),
        scan((acc: null | number[], curr: null | number[]) => {
          if (curr?.length && curr[1] !== DefaultAge[1]) {
            this.isClearingFilter = true;
            delayAgeInMs = 1000;
          } else if (curr?.length && curr[0] !== DefaultAge[0]) {
            this.isClearingFilter = false;
            delayAgeInMs = 4000;
          } else {
            delayAgeInMs = 500;
          }
          return curr;
        }),
        debounce(() => timer(delayAgeInMs)),
        tap(() => this.isAgePopoverOpen.set(false))
      ),
      controls.keyWords.valueChanges.pipe(
        startWith(null),
        map(value => (value ?? '').trim()),
        filter(value => value.length >= 4 || value.length === 0),
        debounceTime(2000)
      ),
      controls.expRange.valueChanges.pipe(
        startWith(null),
        scan((acc: null | number[], curr: null | number[]) => {
          if (curr?.length && curr[1] !== DefaultExpRange[1]) {
            this.isClearingFilter = true;
            delayExpInMs = 1000;
          } else if (curr?.length && curr[0] !== DefaultExpRange[0]) {
            this.isClearingFilter = false;
            delayExpInMs = 4000;
          } else {
            delayExpInMs = 500;
          }
          return curr;
        }),
        debounce(() => timer(delayExpInMs)), 
        tap(() => this.isExperiencePopoverOpen.set(false))
      ),
      controls.eduInstitute.valueChanges.pipe(startWith(null)),
      controls.eduSubject.valueChanges.pipe(startWith(null)),
      controls.salary.valueChanges.pipe(
        startWith(null),
        scan((acc: null | number[], curr: null | number[]) => {
          if (curr?.length && curr[1] !== DefaultSalary[1]) {
            this.isClearingFilter = true;
            delaySalaryInMs = 1000;
          } else if (curr?.length && curr[0] !== DefaultSalary[0]) {
            this.isClearingFilter = false;
            delaySalaryInMs = 4000;
          } else {
            delaySalaryInMs = 500;
          }
          return curr;
        }),
        debounce(() => timer(delaySalaryInMs)), 
        tap(() => this.isSalaryPopoverOpen.set(false))
      ),
      controls.industryType.valueChanges.pipe(startWith(null)),
    ];

    combineLatest(formControlsObs$)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(100),
      map((controls) => {
        const isAllNull = controls.every((control) => control === null);
        return isAllNull ? null : controls;
      }),
      skipWhile((controls) => controls === null),
      scan((acc: any, curr: any) => {
        for (let i = 0; i < curr!.length; i++) {
          if (curr![i] !== null && curr![i] !== acc[i]) {
            this.triggeredBy.update(prev => [...prev, this.getControllerNameByIndex(i, curr)]);
          }
        }
        return this.getFormControlObject(curr);
      }, []),
      switchMap((form: ISearchCountForm) =>
        this.countQueryService
          .getCountQueryParam(form)
      )
    ).subscribe({
      next: (data) => {
        if (data) {
          this.totalCount.update(() => data.totalCvCount);
        }
      },
    });
  }

  showDefaultCount() {
    this.countQueryService
    .getCountQueryParam(this.getFormControlObject([null, null, null, null, null, null, null]))
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        if (data) {
          this.totalCount.update(() => data.totalCvCount);
        }
      },
    });
  }

  private getFormControlObject(data: any[]): ISearchCountForm {
    return {
      keyWords: data[1],
      age: data[0],
      eduInstitute: data[3],
      eduSubject: data[4],
      salary: data[5],
      expRange: data[2],
      industryType: data[6],
    }
  }

  clearSelectedFilter(controlName: string) {
    switch (controlName) {
      case 'Age':
        this.isClearingFilter = true;
        this.controlAgeRange().setValue(DefaultAge);
        this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Age'));
        break;
      case 'Keywords':
        this.controlKeyWords().setValue(null);
        break;
      case 'Experience':
        this.isClearingFilter = true;
        this.controlExpRange().setValue(DefaultExpRange);
        this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Experience'));
        break;
      case 'EduInstitute':
        this.controlEduInstitute().setValue(null);
        this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'EduInstitute'));
        break;
      case 'EduSubject':
        this.controlEduSubject().setValue(null);
        this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'EduSubject'));
        break;
      case 'Salary':
        this.isClearingFilter = true;
        this.controlSalaryRange().setValue(DefaultSalary);
        this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'Salary'));
        break;
      case 'IndustryType':
        this.controlIndustryType().setValue(null);
        this.triggeredBy.update(prev => prev.filter((trigger) => trigger !== 'IndustryType'));
        break;
    }

    setTimeout(() => {
      this.isClearingFilter = false;
    }, 2000);
  }

  onEducationInstituteSelect($event: SelectItem[]) {
    if ($event && $event.length > 0) {
      this.controlEduInstitute().setValue([$event[$event.length - 1]]);
    }
    
    setTimeout(() => {
      this.isEduInstitutePopoverOpen.set(false);
    }, 1);
  }

  onInstituteQueryInput(event: MultiSelectQueryEvent) {
    this.instituteQueried$.next(event);
  }
  
  onEducationSubjectSelect($event: SelectItem[]) {
    setTimeout(() => {
      this.controlEduSubject().setValue($event);
    }, 1);
    this.isEduSubjectPopoverOpen.set(false)
  }

  onIndustryTypeSelect($event: SelectItem[]) {
    setTimeout(() => {
    this.controlIndustryType().setValue($event);
    }, 1);
    this.isIndustryTypePopoverOpen.set(false)
  }

  // searchTalentQueryParams() {
  //   const formData = this.searchTalentForm.value;
  //   let ageTo = '';
  //   let ageFr = '';
  //   let expTo = '';
  //   let expFr = '';

  //   const defaultAgeFrom = DefaultAge[0]; 
  //   const defaultAgeTo = DefaultAge[1];  

  //   const defaultExpFrom = DefaultExpRange[0];
  //   const defaultExpTo = DefaultExpRange[1];

  //   if (formData.age) {
  //     const [from, to] = formData.age;
  //     if (from === defaultAgeFrom && to === defaultAgeTo) {
  //       ageTo = '';
  //       ageFr = '';
  //     } else {
  //       ageFr = String(from);
  //       ageTo = String(to);
  //     }
  //   }

  //   if (formData.expRange) {
  //     const [from, to] = formData.expRange;
  //     if (from === defaultExpFrom && to === defaultExpTo) {
  //       expTo = '';
  //       expFr = '';
  //     } else {
  //       expFr = String(from);
  //       expTo = String(to);
  //     }
  //   }
  //   const queryParams = new URLSearchParams({
  //     cmbAgeTo: ageTo,
  //     cmbAgeFr: ageFr,
  //     InsName: (formData.eduInstitute || ''),
  //     cmbExpTo: expTo,
  //     cmbExpFr: expFr,
  //     txtKeyword: (formData.keyWords || ''),
  //     txtDegree : (formData.eduSubject || ''),
  //     lstBusiness: (formData.industryType || ''),
  //     qSalary: (formData.salary && formData.salary.length > 0 && formData.salary.join('/') === '10000/200000') ? '/' : (formData.salary?.join('/') || '')
  //   });
  //   console.log(queryParams.toString());
  //   const queryString = queryParams.toString();
  //   const apiUrl = `https://corporate3.bdjobs.com/cvbanksearch.asp?${queryString}`;
  //   window.location.href = apiUrl;
  // }

  private animateCount() {
    console.log('totalCount:', this.totalCount());
    const target = this.totalCount();
    const current = this.displayCount();
  
    if (current === target) {
      this.isCrunching.set(false); 
      return;
    }
  
    this.isCrunching.set(true);
  
    const step = Math.ceil(Math.abs(target - current) / 5);
    const next = current < target ? current + step : current - step;
  
    requestAnimationFrame(() => {
      this.displayCount.set(next);
      this.animateCount(); 
    });
  }
  formatDisplayNumber(n: number): string {
    if (this.isCrunching()) {
      return new Intl.NumberFormat('en-IN').format(n);
    }
  
   
    if (n >= 1_000_000) {
      return `${(n / 1_000_000).toFixed(1)}M+`;
    }
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K+';
    return `${n} `;
  }
  
}