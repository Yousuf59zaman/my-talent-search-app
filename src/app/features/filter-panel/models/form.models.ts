import { AbstractControl } from '@angular/forms';
import { SelectItem } from '../../../shared/models/models';

export interface FilterFormControls {
  keyword: AbstractControl<string | null>;
  expectedSalary: AbstractControl<number[]| null>;
  currentSalary: AbstractControl<number[]| null>;
  ageRange: AbstractControl<number[]| null>;
  experience: AbstractControl<number[]| null>;
  category: AbstractControl<SelectItem[] | null>;
  gender: AbstractControl<string | null>;
  isEntry: AbstractControl<boolean| null>;
  isMid: AbstractControl<boolean | null>;
  isTop: AbstractControl<boolean | null>;
  immediateAvailable: AbstractControl<boolean | null>;
  showStarCandidates: AbstractControl<boolean | null>;
  personsWithDisabilities: AbstractControl<boolean | null>;
  location: AbstractControl<SelectItem[] | null>;
  education: AbstractControl<number | null>;
  skills: AbstractControl<SelectItem[] | null>;
  industries: AbstractControl<SelectItem[] | null>;
  courses: AbstractControl<SelectItem[] | null>;
  institutes: AbstractControl<SelectItem[] | null>;
  isCurrentLocation: AbstractControl<boolean | null>;
  isPermanentLocation: AbstractControl<boolean | null>;
  isPreferredLocation: AbstractControl<boolean | null>;
  expertise: AbstractControl<SelectItem[] | null>;
  isRetiredArmy: AbstractControl<boolean | null>;
  isHighestDegree: AbstractControl<boolean | null>;
  isExperience: AbstractControl<boolean | null>,
  isSkills: AbstractControl<boolean | null>,
  isEducation: AbstractControl<boolean | null>;
  industryType: AbstractControl<SelectItem[] | null>;
  videoCV: AbstractControl<boolean | null>;
  shortlist: AbstractControl<{id: string, name: string} | null>;
  lastUpdated: AbstractControl<string | null>;
  purchaseListId: AbstractControl<string | null>;
  isAlreadyPurchased: AbstractControl<boolean | null>;
}

export interface FilterForm {
    keyword: string | null;
    expectedSalary: number[];
    ageRange: number[];
    experience: number[];
    category: SelectItem[] | null;
    gender: string | null;
    isEntry: boolean;
    isMid: boolean;
    isTop: boolean;
    immediateAvailable: boolean;
    showStarCandidates: boolean;
    personsWithDisabilities: boolean;
    location: SelectItem[] | null;
    education: number | null;
    skills: SelectItem[] | null;
    industries: SelectItem[] | null;
    courses: SelectItem[] | null;
    institutes: SelectItem[] | null;
    isExperience: boolean;
    isSkills: boolean;
    isEducation: boolean;
    isCurrentLocation: boolean;
    isPermanentLocation: boolean;
    isPreferredLocation: boolean;
    expertise: SelectItem[] | null;
    isRetiredArmy: boolean;
    isHighestDegree: boolean;
    industryType: SelectItem[] | null;
    currentSalary: number[];
    videoCV: boolean;
    shortlist: {id: string, name: string} | null,
    lastUpdated: string | null;
    purchaseListId: string | null;
    isAlreadyPurchased: boolean;
}