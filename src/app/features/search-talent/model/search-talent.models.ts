import { SelectItem } from "../../../shared/models/models";

export interface SearchHistory {
  keywords?: string;
  filters?: string;
  lastUpdated: string;
}

export interface IndustryType {
  industryTypeID: number;
  displayName: string;
}

export interface EduInstitute {
  eduInstituteID: number;
  displayName: string;
}

export interface EduSubject {
  eduSubjectID: number;
  displayName: string;
}

export interface ISearchCountForm {
  keyWords: string | null;
  age: number[] | null,
  eduInstitute: SelectItem[] | null,
  eduSubject: SelectItem[] | null,
  salary: number[] | null,
  expRange: number[] | null,
  industryType: SelectItem[] | null,
}

export interface ISearchCountQueryRes {
  totalCvCount: number,
  starCvCount: number
}
