import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, OnInit, input, OnChanges, SimpleChanges } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ReactiveFormsModule, FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { RangeSliderComponent } from '../../shared/components/range-slider/range-slider.component';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { InputWithSearchComponent } from '../../shared/components/input-with-search/input-with-search.component';
import { MultiSelectComponent } from '../../shared/components/multi-select/multi-select.component';
import { RadioComponent } from '../../shared/components/radio/radio.component';
import { MultiSelectQueryEvent, SelectItem } from '../../shared/models/models';
import { AgeRangeConfig, DefaultPageSize, ExpRangeConfig, SalaryRangeConfig } from '../../shared/utils/app.const';
import { combineLatest, debounceTime, distinctUntilChanged, Observable, of, skip, skipWhile, startWith, Subject, switchMap, map, tap, filter } from 'rxjs';
import { FilterDataService } from './services/filter-data.service';
import { CommonModule } from '@angular/common';
import { IndustryTypeResponse, InstituteResponse, SearchCountObject, SkillResponse } from './models/filter-datamodel';
import { HomeFilterForm, HomeQueryStore, IHomeQueryStore } from '../../store/home-query.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterForm, FilterFormControls } from './models/form.models';
import { DefaultAge, DefaultExpRange, DefaultSalary, MaxAgeRange, MaxExpRange, MaxSalaryRange } from '../search-talent/search-talent/search-talent.component';
import { QueryService } from './services/query.service';
import { FilterBadge } from '../active-filters/active-filters/active-filters.component';
import { ModalService } from '../../core/services/modal/modal.service';
import { LocalstorageService } from '../../core/services/essentials/localstorage.service';
import { IsCorporateUser } from '../../shared/enums/app.enums';
import { SelectComponent } from '../../shared/components/select/select.component';
import { ToastrService } from 'ngx-toastr';
import { QueryBuilderReverse } from './services/query-builder-reverse';
import { FilterStore } from '../../store/filter.store';

@Component({
  selector: 'app-filter-panel',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RangeSliderComponent,
    CheckboxComponent,
    RadioComponent,
    MultiSelectComponent,
    InputWithSearchComponent,
    SelectComponent,
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanelComponent implements OnInit, OnChanges {
  removedFilter = input<FilterBadge | null>(null);
  shortlist = input<{ id: string; name: string } | undefined>(undefined);
  filtersFromDashboard = input<IHomeQueryStore | null>(null);
  listenOnFilterRemoval = computed(() =>
    this.updateFilterForm(this.removedFilter())
  );

  filterForm = new FormGroup<FilterFormControls>({
    keyword: new FormControl<string | null>(null),
    expectedSalary: new FormControl<number[]>(MaxSalaryRange),
    currentSalary: new FormControl<number[]>([]),
    ageRange: new FormControl<number[]>(MaxAgeRange),
    experience: new FormControl<number[]>(MaxExpRange),
    category: new FormControl<SelectItem[] | null>(null),
    gender: new FormControl<string | null>(null),
    isEntry: new FormControl(false),
    isMid: new FormControl(false),
    isTop: new FormControl(false),
    immediateAvailable: new FormControl<boolean>(false),
    showStarCandidates: new FormControl<boolean>(false),
    personsWithDisabilities: new FormControl<boolean>(false),
    location: new FormControl<SelectItem[] | null>(null),
    education: new FormControl<number | null>(null),
    skills: new FormControl<SelectItem[] | null>(null),
    industries: new FormControl<SelectItem[] | null>(null),
    courses: new FormControl<SelectItem[] | null>(null),
    institutes: new FormControl<SelectItem[] | null>(null),
    isCurrentLocation: new FormControl<boolean>(false),
    isPermanentLocation: new FormControl<boolean>(false),
    isPreferredLocation: new FormControl<boolean>(false),
    expertise: new FormControl<SelectItem[] | null>(null),
    isRetiredArmy: new FormControl<boolean>(false),
    isHighestDegree: new FormControl<boolean>(false),
    isExperience: new FormControl<boolean>({ value: false, disabled: true }),
    isSkills: new FormControl<boolean>({ value: false, disabled: true }),
    isEducation: new FormControl<boolean>({ value: false, disabled: true }),
    industryType: new FormControl<SelectItem[] | null>(null),
    videoCV: new FormControl<boolean>(false),
    shortlist: new FormControl<{ id: string; name: string } | null>(null),
    lastUpdated: new FormControl<string | null>(null),
    purchaseListId: new FormControl<string | null>(null),
    isAlreadyPurchased: new FormControl<boolean | null>(false),
  });

  ageRangeConfig = AgeRangeConfig;
  expRangeConfig = ExpRangeConfig;
  salaryRangeConfig = SalaryRangeConfig;
  multiSelectType = MultiSelectType;

  private _isSaveFilterPopoverVisible = signal<boolean>(false);
  private _saveAsNewFilter = signal<boolean>(false);
  suggestionsWithCounts = signal<SearchCountObject | null>(null);
  private activeFilterTypeSignal = signal<string>('category');
  private activeFilterSection = signal<string>('quickFilters');

  filterNameInput = new FormControl('', [
    Validators.maxLength(45),
    Validators.pattern(/^[^'%"<>&()]*$/),
  ]);
  salaryControl = computed(
    () => this.filterForm.get('expectedSalary') as FormControl<number[]>
  );
  currentSalaryControl = computed(
    () => this.filterForm.get('currentSalary') as FormControl<number[]>
  );
  ageControl = computed(
    () => this.filterForm.get('ageRange') as FormControl<number[]>
  );
  experienceControl = computed(
    () => this.filterForm.get('experience') as FormControl<number[]>
  );
  keywordControl = computed(
    () => this.filterForm.get('keyword') as FormControl<string | null>
  );
  categoryControl = computed(
    () => this.filterForm.get('category') as FormControl<SelectItem[] | null>
  );
  genderControl = computed(
    () => this.filterForm.get('gender') as FormControl<string | null>
  );
  isEntryControl = computed(
    () => this.filterForm.get('isEntry') as FormControl<boolean>
  );
  isMidControl = computed(
    () => this.filterForm.get('isMid') as FormControl<boolean>
  );
  isTopControl = computed(
    () => this.filterForm.get('isTop') as FormControl<boolean>
  );
  immediateAvailableControl = computed(
    () => this.filterForm.get('immediateAvailable') as FormControl<boolean>
  );
  showStarCandidatesControl = computed(
    () => this.filterForm.get('showStarCandidates') as FormControl<boolean>
  );
  personsWithDisabilitiesControl = computed(
    () => this.filterForm.get('personsWithDisabilities') as FormControl<boolean>
  );
  locationControl = computed(
    () => this.filterForm.get('location') as FormControl<SelectItem[] | null>
  );
  educationControl = computed(
    () => this.filterForm.get('education') as FormControl<number | null>
  );
  skillsControl = computed(
    () => this.filterForm.get('skills') as FormControl<SelectItem[] | null>
  );
  industriesControl = computed(
    () => this.filterForm.get('industries') as FormControl<SelectItem[] | null>
  );
  coursesControl = computed(
    () => this.filterForm.get('courses') as FormControl<SelectItem[] | null>
  );
  institutesControl = computed(
    () => this.filterForm.get('institutes') as FormControl<SelectItem[] | null>
  );
  isCurrentLocationControl = computed(
    () => this.filterForm.get('isCurrentLocation') as FormControl<boolean>
  );
  isPermanentLocationControl = computed(
    () => this.filterForm.get('isPermanentLocation') as FormControl<boolean>
  );
  isPreferredLocationControl = computed(
    () => this.filterForm.get('isPreferredLocation') as FormControl<boolean>
  );
  expertiseInputControl = computed(
    () => this.filterForm.get('expertise') as FormControl<SelectItem[] | null>
  );
  isRetiredArmyControl = computed(
    () => this.filterForm.get('isRetiredArmy') as FormControl<boolean>
  );
  isHighestDegreeControl = computed(
    () => this.filterForm.get('isHighestDegree') as FormControl<boolean>
  );
  isExperienceControl = computed(
    () => this.filterForm.get('isExperience') as FormControl<boolean>
  );
  isSkillsControl = computed(
    () => this.filterForm.get('isSkills') as FormControl<boolean>
  );
  isEducationControl = computed(
    () => this.filterForm.get('isEducation') as FormControl<boolean>
  );
  industryTypeControl = computed(
    () =>
      this.filterForm.get('industryType') as FormControl<SelectItem[] | null>
  );
  videoCVControl = computed(
    () => this.filterForm.get('videoCV') as FormControl<boolean>
  );
  lastUpdatedControl = computed(
    () => this.filterForm.get('lastUpdated') as FormControl<string | null>
  );
  activeFilterType = computed(() => this.activeFilterTypeSignal());

  isSaveFilterPopoverVisible = computed(() =>
    this._isSaveFilterPopoverVisible()
  );

  saveAsNewFilter = computed(() => this._saveAsNewFilter());

  isQuickFiltersOpen = computed(
    () => this.activeFilterSection() === 'quickFilters'
  );
  isExperienceFiltersOpen = computed(
    () => this.activeFilterSection() === 'experienceFilters'
  );
  isAcademicFiltersOpen = computed(
    () => this.activeFilterSection() === 'academicFilters'
  );
  isOthersFiltersOpen = computed(
    () => this.activeFilterSection() === 'othersFilters'
  );

  private currentFilterData: FilterForm = {} as FilterForm;

  private filterDataService = inject(FilterDataService);
  private homeQueryStore = inject(HomeQueryStore);
  private filterStore = inject(FilterStore);
  private destroyRef = inject(DestroyRef);
  private queryService = inject(QueryService);
  private modalService = inject(ModalService);
  private storageService = inject(LocalstorageService);

  filteredLocationSuggestions = signal<SelectItem[]>([]);
  filteredInstituteSuggestions = signal<SelectItem[]>([]);
  filteredSkillSuggestions = signal<SelectItem[]>([]);
  filteredExpertiseSuggestions = signal<SelectItem[]>([]);
  filteredIndustrySuggestions = signal<SelectItem[]>([]);
  filteredCategorySuggestions = signal<SelectItem[]>([]);
  filteredCoursesSuggestions = signal<SelectItem[]>([]);
  filteredIndustryTypeSuggestions = signal<SelectItem[]>([]);

  genders = [
    { label: 'Male', id: 'Male', name: 'gender' },
    { label: 'Female', id: 'Female', name: 'gender' },
    { label: 'Other', id: 'Other', name: 'gender' },
  ];

  lastUpdatedOptions: SelectItem[] = [
    { label: '1 Month', value: '30' },
    { label: '3 Months', value: '90' },
    { label: '6 Months', value: '180' },
    { label: '1 Year', value: '365' },
    { label: '2 Years', value: '730' },
  ];

  isCorporateUser = computed(
    () => this.storageService.getItem(IsCorporateUser) === 'true'
  );
  private locationQueried$ = new Subject<MultiSelectQueryEvent>();
  private instituteQueried$ = new Subject<MultiSelectQueryEvent>();
  private skillQueried$ = new Subject<MultiSelectQueryEvent>();
  private expertiseQueried$ = new Subject<MultiSelectQueryEvent>();
  private industryQueried$ = new Subject<MultiSelectQueryEvent>();

  private listenOnLocationQuery = this.locationQueried$
    .pipe(
      switchMap((event) => this.getLocationsObservable(event)),
      map((response) => {
        if (!response?.data) return [];

        return response.data.map((item: any) => ({
          label: item.locName,
          value: item.locId,
          selectId: this.getTimeBasedIdForSelect(item.locId),
        }));
      })
    )
    .subscribe((locationSelectItems) => {
      this.setLocationSuggestions(locationSelectItems);
    });

  private listenOnInstituteQuery = this.instituteQueried$
    .pipe(
      switchMap((event) => this.getInstitutesObservable(event)),
      map((response) => {
        if (!response?.data) {
          return [];
        }

        return response.data.map((item: InstituteResponse) => ({
          label: item.instituteName,
          value: item.instituteId,
          selectId: this.getTimeBasedIdForSelect(item.instituteId),
        }));
      })
    )
    .subscribe((instituteSelectItems) => {
      this.setInstituteSuggestions(instituteSelectItems);
    });

  private listenOnSkillQuery = this.skillQueried$
    .pipe(
      switchMap((event) => this.getSkillsObservable(event)),
      map((response) => {
        if (!response?.data) return [];

        return response.data.map((item: SkillResponse) => ({
          label: item.value,
          value: item.id,
          selectId: this.getTimeBasedIdForSelect(item.id),
        }));
      })
    )
    .subscribe((skillSelectItems) => {
      this.setSkillSuggestions(skillSelectItems);
    });

  private listenOnExpertiseQuery = this.expertiseQueried$
    .pipe(
      switchMap((event) => this.getExpertiseObservable(event)),
      map((response) => {
        if (!response?.data) return [];

        return response.data.map((item: SkillResponse) => ({
          label: item.value,
          value: item.id,
          selectId: this.getTimeBasedIdForSelect(item.id),
        }));
      })
    )
    .subscribe((expertiseSelectItems) => {
      this.setExpertiseSuggesions(expertiseSelectItems);
    });

  private listenOnIndustryQuery = this.industryQueried$
    .pipe(
      switchMap((event) => this.getIndustriesObservable(event)),
      map((response) => {
        if (!response?.data) return [];

        return response.data.map((item: IndustryTypeResponse) => ({
          label: item.orG_TYPE_NAME,
          value: item.orG_TYPE_ID,
          selectId: this.getTimeBasedIdForSelect(item.orG_TYPE_ID),
        }));
      })
    )
    .subscribe((industrySelectItems) => {
      this.setIndustrySuggestions(industrySelectItems);
    });

  private listenOnRefreshQuery = this.queryService.isRefreshQuery$
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((isRefresh) => isRefresh)
    )
    .subscribe({
      next: () => this.queryService.filterQuery$.next(this.currentFilterData),
    });

  filterQuery$!: Observable<FilterForm>;
  isTouchedAgeControl = signal(false);
  isTouchedExpControl = signal(false);
  isTouchedSalaryControl = signal(false);

  constructor() {
    this.listenOnFormChanges();
    this.listenToLocationChanges();
  }

  private listenOnFormChanges() {
    const controls = this.filterForm.controls;
    const formControlsObs$ = [
      controls.ageRange.valueChanges.pipe(
        startWith(null),
        tap((val) => {
          if (
            val !== null &&
            val.length === 2 &&
            !this.isDefaultRange(val, MaxAgeRange)
          ) {
            this.isTouchedAgeControl.set(true);
          } else this.isTouchedAgeControl.set(false);
        })
      ),
      controls.experience.valueChanges.pipe(
        startWith(null),
        tap((val) => {
          if (
            val !== null &&
            val.length === 2 &&
            !this.isDefaultRange(val, MaxExpRange)
          ) {
            this.isTouchedExpControl.set(true);
          } else this.isTouchedExpControl.set(false);
        })
      ),
      controls.expectedSalary.valueChanges.pipe(
        startWith(null),
        tap((val) => {
          if (
            val !== null &&
            val.length === 2 &&
            !this.isDefaultRange(val, MaxSalaryRange)
          ) {
            this.isTouchedSalaryControl.set(true);
          } else this.isTouchedSalaryControl.set(false);
        })
      ),
      controls.gender.valueChanges.pipe(startWith(null)),
      controls.institutes.valueChanges.pipe(startWith(null)),
      controls.isEntry.valueChanges.pipe(startWith(null)),
      controls.keyword.valueChanges.pipe(
        startWith(null),
        tap((val) => this.handleKeywordCheckboxes(val, controls)),
        debounceTime(1000)
      ),
      controls.location.valueChanges.pipe(startWith(null)),
      controls.education.valueChanges.pipe(startWith(null)),
      controls.skills.valueChanges.pipe(startWith(null)),
      controls.industries.valueChanges.pipe(startWith(null)),
      controls.courses.valueChanges.pipe(startWith(null)),
      controls.isCurrentLocation.valueChanges.pipe(startWith(null)),
      controls.isPermanentLocation.valueChanges.pipe(startWith(null)),
      controls.isPreferredLocation.valueChanges.pipe(startWith(null)),
      controls.expertise.valueChanges.pipe(startWith(null)),
      controls.isRetiredArmy.valueChanges.pipe(startWith(null)),
      controls.isHighestDegree.valueChanges.pipe(startWith(null)),
      controls.isMid.valueChanges.pipe(startWith(null)),
      controls.isTop.valueChanges.pipe(startWith(null)),
      controls.immediateAvailable.valueChanges.pipe(startWith(null)),
      controls.showStarCandidates.valueChanges.pipe(startWith(null)),
      controls.personsWithDisabilities.valueChanges.pipe(startWith(null)),
      controls.category.valueChanges.pipe(startWith(null)),
      controls.isExperience.valueChanges.pipe(startWith(null)),
      controls.isSkills.valueChanges.pipe(startWith(null)),
      controls.isEducation.valueChanges.pipe(startWith(null)),
      controls.industryType.valueChanges.pipe(startWith(null)),
      controls.currentSalary.valueChanges.pipe(startWith(null)),
      controls.videoCV.valueChanges.pipe(startWith(null)),
      controls.shortlist.valueChanges.pipe(
        startWith(this.shortlist() ? this.shortlist() : null)
      ),
      controls.lastUpdated.valueChanges.pipe(startWith(null)),
      controls.purchaseListId.valueChanges.pipe(startWith(null)),
      controls.isAlreadyPurchased.valueChanges.pipe(startWith(null)),
    ];

    this.filterQuery$ = combineLatest(formControlsObs$).pipe(
      takeUntilDestroyed(this.destroyRef),
      distinctUntilChanged(),
      debounceTime(100),
      map((controls) => {
        const isAllNull = controls.every((control) => control === null);
        return isAllNull ? null : controls;
      }),
      skipWhile((controls) => controls === null),
      map((controls: any) => {
        const formGroupObj: FilterForm = {
          ageRange: controls && controls.length ? controls[0] : null,
          experience: controls && controls.length ? controls[1] : null,
          expectedSalary: controls && controls.length ? controls[2] : null,
          gender: controls && controls.length ? controls[3] : null,
          institutes: controls && controls.length ? controls[4] : null,
          isEntry: controls && controls.length ? controls[5] : null,
          keyword: controls && controls.length ? controls[6] : null,
          location: controls && controls.length ? controls[7] : null,
          education: controls && controls.length ? controls[8] : null,
          skills: controls && controls.length ? controls[9] : null,
          industries: controls && controls.length ? controls[10] : null,
          courses: controls && controls.length ? controls[11] : null,
          isCurrentLocation: controls && controls.length ? controls[12] : null,
          isPermanentLocation:
            controls && controls.length ? controls[13] : null,
          isPreferredLocation:
            controls && controls.length ? controls[14] : null,
          expertise: controls && controls.length ? controls[15] : null,
          isRetiredArmy: controls && controls.length ? controls[16] : null,
          isHighestDegree: controls && controls.length ? controls[17] : null,
          isMid: controls && controls.length ? controls[18] : null,
          isTop: controls && controls.length ? controls[19] : null,
          immediateAvailable: controls && controls.length ? controls[20] : null,
          showStarCandidates: controls && controls.length ? controls[21] : null,
          personsWithDisabilities:
            controls && controls.length ? controls[22] : null,
          category: controls && controls.length ? controls[23] : null,
          isExperience: controls && controls.length ? controls[24] : null,
          isSkills: controls && controls.length ? controls[25] : null,
          isEducation: controls && controls.length ? controls[26] : null,
          industryType: controls && controls.length ? controls[27] : null,
          currentSalary: controls && controls.length ? controls[28] : null,
          videoCV: controls && controls.length ? controls[29] : null,
          shortlist: controls && controls.length ? controls[30] : null,
          lastUpdated: controls && controls.length ? controls[31] : null,
          purchaseListId: controls && controls.length ? controls[32] : null,
          isAlreadyPurchased: controls && controls.length ? controls[33] : null,
        };

        return formGroupObj;
      })
    );

    this.filterQuery$
      .pipe(
        skip(0),
        takeUntilDestroyed(this.destroyRef),
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe({
        next: (query: FilterForm) => {
          this.currentFilterData = query;
          this.queryService.pagination = {
            pageNo: 1,
            pageSize: DefaultPageSize,
          };
          this.queryService.isQueryLoading.next(true);
          this.queryService.filterQuery$.next(query);
        },
      });
  }

  private handleKeywordCheckboxes(
    val: string | null,
    controls: FilterFormControls
  ): void {
    if (val !== null && val.trim() !== '') {
      controls.isExperience.enable({ emitEvent: false });
      controls.isSkills.enable({ emitEvent: false });
      controls.isEducation.enable({ emitEvent: false });
    } else {
      controls.isExperience.setValue(false, { emitEvent: false });
      controls.isExperience.disable({ emitEvent: false });
      controls.isSkills.setValue(false, { emitEvent: false });
      controls.isSkills.disable({ emitEvent: false });
      controls.isEducation.setValue(false, { emitEvent: false });
      controls.isEducation.disable({ emitEvent: false });
    }
  }

  private listenToLocationChanges() {
    const locationControl = this.filterForm.get('location') as FormControl<
      SelectItem[] | null
    >;
    const isCurrentLocationControl = this.filterForm.get(
      'isCurrentLocation'
    ) as FormControl<boolean>;
    const isPermanentLocationControl = this.filterForm.get(
      'isPermanentLocation'
    ) as FormControl<boolean>;
    const isPreferredLocationControl = this.filterForm.get(
      'isPreferredLocation'
    ) as FormControl<boolean>;

    locationControl.valueChanges.subscribe((locationValue) => {
      if (locationValue && locationValue.length > 0) {
        if (!isCurrentLocationControl.value) {
          isCurrentLocationControl.setValue(true);
        }
      } else {
        isCurrentLocationControl.setValue(false, { emitEvent: false });
        isPermanentLocationControl.setValue(false, { emitEvent: false });
        isPreferredLocationControl.setValue(false, { emitEvent: false });
      }

      if (locationValue && locationValue.length > 0) {
        const atLeastOneChecked =
          isCurrentLocationControl.value ||
          isPermanentLocationControl.value ||
          isPreferredLocationControl.value;
        if (!atLeastOneChecked) {
          isCurrentLocationControl.setValue(true, { emitEvent: false });
        }
      }
    });

    [
      isCurrentLocationControl,
      isPermanentLocationControl,
      isPreferredLocationControl,
    ].forEach((control) => {
      control.valueChanges.subscribe(() => {
        const atLeastOneChecked =
          isCurrentLocationControl.value ||
          isPermanentLocationControl.value ||
          isPreferredLocationControl.value;
        if (
          !atLeastOneChecked &&
          locationControl.value &&
          locationControl.value.length > 0
        ) {
          isCurrentLocationControl.setValue(true, { emitEvent: false });
        }
      });
    });
  }

  private isDefaultRange(
    inputRange: number[],
    defaultRange: number[]
  ): boolean {
    return (
      inputRange[0] === defaultRange[0] && inputRange[1] === defaultRange[1]
    );
  }

  getLocationsObservable(event: MultiSelectQueryEvent): Observable<any> {
    return event?.query?.trim()
      ? this.filterDataService.getLocationsByQuery({
          SearchState: event?.query,
        })
      : of(null);
  }

  getInstitutesObservable(event: MultiSelectQueryEvent): Observable<any> {
    if (!event?.query?.trim()) {
      return of(null);
    }

    return this.filterDataService.getInstitutes({
      InstituteName: event?.query,
    });
  }

  getExpertiseObservable(event: MultiSelectQueryEvent): Observable<any> {
    if (!event?.query?.trim()) {
      return of(null);
    }

    return this.filterDataService.getExpertise({
      CategoryId: 8,
      searchTxt: event.query,
    });
  }

  getSkillsObservable(event: MultiSelectQueryEvent): Observable<any> {
    if (!event?.query?.trim()) {
      return of(null);
    }

    return this.filterDataService.getSkills({
      CategoryId: 8,
      searchTxt: event.query,
    });
  }

  getIndustriesObservable(event: MultiSelectQueryEvent): Observable<any> {
    if (!event?.query?.trim()) {
      return of(null);
    }

    return this.filterDataService.getIndustries({
      IndustryTypeName: event?.query,
    });
  }

  prepareSuggestions(
    objects: any[],
    callback: (selectItems: SelectItem[]) => void = () => {}
  ) {
    const filteredSuggestions: SelectItem[] = [];

    if (objects?.length) {
      filteredSuggestions.push(...objects);
    }

    callback(filteredSuggestions);
  }

  setLocationSuggestions(locationSelectItems: SelectItem[]) {
    this.filteredLocationSuggestions.set(locationSelectItems);
  }

  setInstituteSuggestions(instituteSelectItems: SelectItem[]) {
    this.filteredInstituteSuggestions.set(instituteSelectItems);
  }

  setSkillSuggestions(skillSelectItems: SelectItem[]) {
    this.filteredSkillSuggestions.set(skillSelectItems);
  }

  setExpertiseSuggesions(expertiseSelectItems: SelectItem[]) {
    this.filteredExpertiseSuggestions.set(expertiseSelectItems);
  }

  setIndustrySuggestions(industrySelectItems: SelectItem[]) {
    this.filteredIndustrySuggestions.set(industrySelectItems);
  }

  setCategorySuggestions(categorySelectItems: SelectItem[]) {
    this.filteredCategorySuggestions.set(categorySelectItems);
  }

  onLocationQueryInput(event: MultiSelectQueryEvent) {
    this.locationQueried$.next(event);
  }

  onInstituteQueryInput(event: MultiSelectQueryEvent) {
    this.instituteQueried$.next(event);
  }

  onExpertiseQueryInput(event: MultiSelectQueryEvent) {
    this.expertiseQueried$.next(event);
  }

  onSkillQueryInput(event: MultiSelectQueryEvent) {
    this.skillQueried$.next(event);
  }

  onIndustryQueryInput(event: MultiSelectQueryEvent) {
    this.industryQueried$.next(event);
  }

  filterCategoriesLocally(event: MultiSelectQueryEvent) {
    const query = event.query.toLowerCase().trim();
    const filteredItems = this.suggestionsWithCounts()?.categories.filter(
      (item) => item.label.toLowerCase().includes(query)
    );

    this.filteredCategorySuggestions.set(filteredItems || []);
  }

  filterCoursesLocally(event: MultiSelectQueryEvent) {
    const query = event.query.toLowerCase().trim();
    const filteredItems = this.suggestionsWithCounts()?.courses.filter((item) =>
      item.label.toLowerCase().includes(query)
    );

    this.filteredCoursesSuggestions.set(filteredItems || []);
  }

  filterIndustryTypeLocally(event: MultiSelectQueryEvent) {
    const query = event.query.toLowerCase().trim();
    const filteredItems = this.suggestionsWithCounts()?.industries.filter(
      (item) => item.label.toLowerCase().includes(query)
    );
    this.filteredIndustryTypeSuggestions.set(filteredItems || []);
  }

  getUpdatedItem($event: SelectItem[], label: string) {
    console.log($event);
    console.log(this.filterForm.value);
  }

  private getTimeBasedIdForSelect(value: number) {
    return (value || '') + '_' + Date.now();
  }

  toggleSection(section: string): void {
    if (this.activeFilterSection() === section) {
      this.activeFilterSection.set('');
    } else {
      this.activeFilterSection.set(section);
    }
  }

  toggleSaveFilterPopover(): void {
    this._isSaveFilterPopoverVisible.update((value) => !value);
  }

  closeSaveFilterPopover(): void {
    this._isSaveFilterPopoverVisible.set(false);
    this._saveAsNewFilter.set(false);
  }

  toggleSaveAsNew(): void {
    this._saveAsNewFilter.update((value) => !value);
  }

  setActiveFilterType(type: string): void {
    this.activeFilterTypeSignal.set(type);
  }

  ngOnInit() {
    this.getIndividualCountinGroup();
    if (!this.filtersFromDashboard()) {
      this.syncFilterFormWithDashboardFilters();
    }
    if (!this.isCorporateUser()) {
      this.activeFilterSection.set('experienceFilters');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['removedFilter'] && changes['removedFilter'].currentValue) {
      this.updateFilterForm(changes['removedFilter'].currentValue);
    }
    if (
      changes['filtersFromDashboard'] &&
      changes['filtersFromDashboard'].currentValue
    ) {
      this.queryService.isQueryLoading.next(true);
      this.syncFilterFormWithDashboardFilters();
    }
    if (changes['shortlist'] && changes['shortlist'].currentValue) {
      const shortlist = this.shortlist();
      if (shortlist && this.filterForm) {
        this.filterForm.get('shortlist')?.setValue(shortlist);
      }
    }
  }

  getIndividualCountinGroup() {
    this.filterDataService.getSearchCount().subscribe({
      next: (searchCountObject) => {
        this.suggestionsWithCounts.set(searchCountObject);
        this.filteredCategorySuggestions.set(searchCountObject.categories);
        this.filteredCoursesSuggestions.set(searchCountObject.courses);
        this.filteredIndustryTypeSuggestions.set(searchCountObject.industries);
      },
      error: (err) => {
        console.error('Error loading search counts', err);
      },
    });
  }

  ngOnDestroy() {
    if (this.listenOnLocationQuery) {
      this.listenOnLocationQuery.unsubscribe();
    }

    if (this.listenOnInstituteQuery) {
      this.listenOnInstituteQuery.unsubscribe();
    }

    if (this.listenOnSkillQuery) {
      this.listenOnSkillQuery.unsubscribe();
    }
    if (this.listenOnIndustryQuery) {
      this.listenOnIndustryQuery.unsubscribe();
    }
  }

  async syncFilterFormWithDashboardFilters() {
    if (this.filtersFromDashboard()) {
      const filter = this.filtersFromDashboard();
      if (
        filter?.filters.age &&
        this.isDefaultRange(filter?.filters.age, DefaultAge)
      ) {
        filter.filters.age = [];
      }
      if (
        filter?.filters.expRange &&
        this.isDefaultRange(filter?.filters.expRange, DefaultExpRange)
      ) {
        filter.filters.expRange = [];
      }
      if (
        filter?.filters.salary &&
        this.isDefaultRange(filter?.filters.salary, DefaultSalary)
      ) {
        filter.filters.salary = [];
      }
      if (
        this.isOnlyDefaultRange(filter?.filters) &&
        !filter?.filters?.keyWords &&
        !filter?.filters?.eduInstitute &&
        !filter?.filters?.eduSubject &&
        !filter?.filters?.industryType
      ) {
        this.triggerDefaultFilterQuery();
        return;
      }

      if (filter?.filters?.keyWords) {
        this.filterForm.get('keyword')?.setValue(filter?.filters?.keyWords);
      }
      if (filter?.filters?.age && filter?.filters?.age.length) {
        this.filterForm.get('ageRange')?.setValue(filter?.filters?.age);
      }
      if (filter?.filters?.expRange && filter?.filters?.expRange.length) {
        this.filterForm.get('experience')?.setValue(filter?.filters?.expRange);
      }
      if (filter?.filters?.salary && filter?.filters?.salary.length) {
        this.filterForm
          .get('expectedSalary')
          ?.setValue(filter?.filters?.salary);
      }
      if (
        filter?.filters?.industryType &&
        filter?.filters?.industryType.length
      ) {
        this.filterForm
          .get('industries')
          ?.setValue(filter?.filters?.industryType);
      }
      if (
        filter?.filters.eduInstitute &&
        filter?.filters?.eduInstitute.length
      ) {
        this.filterForm
          .get('institutes')
          ?.setValue(filter?.filters?.eduInstitute);
      }
      if (filter?.filters?.eduSubject && filter?.filters?.eduSubject.length) {
        this.filterForm.get('courses')?.setValue(filter?.filters?.eduSubject);
      }
      if (
        filter?.filters.category &&
        filter.filters.category.type === 'category'
      ) {
        this.updateCategoryFilter(filter);
      }
      if (
        filter?.filters.category &&
        filter.filters.category.type === 'recent'
      ) {
        this.updateCategoryFilter(filter);
        this.filterForm.get('lastUpdated')?.setValue('365');
      }
      if (
        filter?.filters.category &&
        filter.filters.category.type === 'immediate'
      ) {
        this.updateCategoryFilter(filter);
        this.filterForm.get('immediateAvailable')?.setValue(true);
      }
      if (filter?.filters.category && filter.filters.category.type === 'star') {
        this.updateCategoryFilter(filter);
        this.filterForm.get('showStarCandidates')?.setValue(true);
      }
      if (
        filter?.filters.category &&
        filter.filters.category.type === 'shortlisted'
      ) {
        this.filterForm.get('shortlist')?.setValue({
          id: filter.filters.category.category.id.toString(),
          name: filter.filters.category.category.categoryName,
        });
        this.filterStore.setIsShortlist(true);
        if (
          filter?.filters.category.category.filters &&
          filter.filters.category.category.filters['id'] !== undefined
        ) {
          this.filterStore.setShortlistGuidId(
            filter.filters.category.category.filters['id']
          );
        }
      }
      if (
        filter?.filters.category &&
        filter.filters.category.type === 'saved'
      ) {
        const form = await QueryBuilderReverse.toFilterForm(
          filter.filters.category.category.filters,
          this.filterDataService
        );
        this.filterForm.patchValue(form);
      }
      if (filter?.filters.category && filter.filters.category.type === 'purchased') {
        this.filterForm.get('purchaseListId')?.setValue(
          filter.filters.category.category.id.toString()
        );
        this.filterForm.get('isAlreadyPurchased')?.setValue(
          filter?.filters.category.category.filters &&
          filter.filters.category.category.filters['isAlreadyPurchased'] !== undefined
            ? filter.filters.category.category.filters['isAlreadyPurchased']
            : null
        );
        this.filterStore.setIsPurchaseList(true);
      }
      return;
    }
    this.triggerDefaultFilterQuery();
  }

  private updateCategoryFilter(filter: IHomeQueryStore | null) {
    this.filterForm.get('category')?.setValue([
      {
        label: filter?.filters?.category?.category?.categoryName || '',
        value: filter?.filters?.category?.category.id,
        selectId: this.getTimeBasedIdForSelect(
          filter?.filters?.category?.category?.id || 0
        ),
      },
    ]);
  }

  private triggerDefaultFilterQuery() {
    this.queryService.isQueryLoading.next(true);
    this.queryService.filterQuery$.next({} as FilterForm); //Triggers Query obs when no filter is coming from dashboard
  }

  isOnlyDefaultRange(filter: HomeFilterForm | undefined): boolean {
    if (!filter) return false;
    return (
      filter.age?.length === 0 &&
      filter.expRange?.length === 0 &&
      filter.salary?.length === 0 &&
      filter.keyWords === null &&
      filter.eduInstitute === null &&
      filter.eduSubject === null
    );
  }

  updateFilterForm(removedFilter: FilterBadge | null) {
    if (removedFilter) {
      if (removedFilter.id === 'clearAll') {
        this.filterForm.reset();
        this.experienceControl().setValue(MaxExpRange);
        this.salaryControl().setValue(MaxSalaryRange);
        this.ageControl().setValue(MaxAgeRange);
        return;
      }
      const filterKey = removedFilter.id as keyof FilterFormControls;
      const control = this.filterForm.get(filterKey);
      if (control) {
        const currentValue = control.value;
        if (
          Array.isArray(currentValue) &&
          currentValue.length === 2 && // a range control
          typeof currentValue[0] === 'number' &&
          typeof currentValue[1] === 'number'
        ) {
          this.resetRangeControls(
            control as AbstractControl<number[]>,
            filterKey
          );
        } else if (
          Array.isArray(currentValue) &&
          typeof currentValue[0] !== 'number'
        ) {
          const updatedValue = currentValue.filter(
            (item: any) => item.selectId !== removedFilter.value.selectId
          ) as SelectItem[];
          control.setValue(updatedValue.length > 0 ? updatedValue : null);
        } else {
          control.setValue(null);
        }
      }
    }
  }
  private resetRangeControls(
    control: AbstractControl<number[]>,
    key: keyof FilterFormControls
  ) {
    if (!key) return;
    switch (key) {
      case 'ageRange':
        this.ageControl().setValue(MaxAgeRange);
        break;
      case 'expectedSalary':
        this.salaryControl().setValue(MaxSalaryRange);
        break;
      case 'experience':
        this.experienceControl().setValue(MaxExpRange);
        break;
    }
  }
  saveFilterpopup(): void {
    this._isSaveFilterPopoverVisible.set(true);
  }
  public toastr = inject(ToastrService);
  saveFilter(): void {
    const filterName = this.filterNameInput.value || '';
    if (!filterName.trim() && filterName) {
      return;
    }

    this.filterDataService
      .saveFilter(this.currentFilterData, filterName, this._saveAsNewFilter())
      .subscribe({
        next: (response) => {
          this.closeSaveFilterPopover();
          this.toastr.success('Filter saved successfully!', 'Success');
        },
        error: (err) => {
          this.toastr.error(
            'Failed to save filter. Please try again.',
            'Error'
          );
        },
      });
  }
}

export interface BaseObject {
  id: number;
  name: string;
}

export enum MultiSelectType {
  IndustryLabel = 'Industry',
  IndustryFormField = 'industry',
  SkillsLabel = 'Expertise/Skills',
  SkillsformField = 'skills',
  InstitutesLabel = 'Institutes(You can select at most 5 Institutes)',
  InstitutesFormField = 'institutes',
  LocationFormField = 'location',
  CategoryLabel = 'Category',
  CategoryFormField = 'category',
}
