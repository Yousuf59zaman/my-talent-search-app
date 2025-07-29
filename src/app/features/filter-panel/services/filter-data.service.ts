import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../../../shared/models/response';
import { environment } from '../../../../environments/environment';
import { SearchCountResponse, CATEGORY_MAP, SearchCountObject, DegreeLevel, IndustryTypeResponse, IndustryOrExpertiseResponse, InstituteResponse, MajorSubRes, SkillResponse, SaveFilterRequest } from '../models/filter-datamodel';
import { SelectItem } from '../../../shared/models/models';
import { FilterForm } from '../models/form.models';
import { CompanyIdLocalStorage } from '../../../shared/enums/app.enums';
import { FilterStore } from '../../../store/filter.store';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { MaxAgeRange, MaxExpRange, MaxSalaryRange } from '../../search-talent/search-talent/search-talent.component';


@Injectable({
  providedIn: 'root'
})
export class FilterDataService {

  constructor(
    private http: HttpClient,
    private localStorageService: LocalstorageService
  ) { }
 private filterStore=inject(FilterStore); 
  getIndustries(queryParams: any) {
    const url = "https://testmongo.bdjobs.com/CVBankSupport/api/LeftPanel/GetIndustryTypeByName";
    return this.http.get<ApiResponse<IndustryTypeResponse[]>>(url, { params: queryParams });
  }
  
  getExpertise(queryParams: any) {
    const url = 'https://testmongo.bdjobs.com/CVBankSupport/api/LeftPanel/GetSkills';
    return this.http.get<ApiResponse<IndustryOrExpertiseResponse[]>>(url, { params: queryParams});
  }
  
  getInstitutes(queryParams: any) {
    const url = "https://testmongo.bdjobs.com/CVBankSupport/api/LeftPanel/GetInstitute";
    return this.http.get<ApiResponse<InstituteResponse[]>>(url, { params: queryParams});
  }

  getMajorSubject() {
    const url = environment.baseUrl + "recruitmentcenter/API/FilterApplicants/GetMajorSubject"
    return this.http.get<ApiResponse<MajorSubRes[]>>(url);
  }
  getLocationsByQuery(queryParams: any): Observable<any> {
    const url = "https://gateway.bdjobs.com/cvbanksupport/api/LeftPanel/GetLocations"
    return this.http.get(url, { params: queryParams});
  }

  getLocationsById(queryParams: any) {
    const url = "https://gateway.bdjobs.com/cvbanksupport/api/LeftPanel/GetLocations"
    return this.http.get<ApiResponse<Location[]>>(url, { params: queryParams});
  }

  getSkills(queryParams: { CategoryId: number, searchTxt: string }) {
    const url = "https://testmongo.bdjobs.com/CVBankSupport/api/LeftPanel/GetSkills";
    return this.http.get<ApiResponse<SkillResponse[]>>(url, { params: queryParams });
  }

  getSkillsByIds(queryParams: { searchTxt: string }) {
    const url = "https://testmongo.bdjobs.com/CVBankSupport/api/LeftPanel/GetSkillsData";
    return this.http.get<ApiResponse<SkillResponse[]>>(url, { params: queryParams });
  }

  getSearchCount(params?: any): Observable<SearchCountObject> {
    const url = "https://gateway.bdjobs.com/cvbank/api/CVBank/SearchCount";
    const defaultParams = {
      CompanyId: 'ZxU0PRC=',
      CatId: '',
      CatName: '',
      qSex: '',
      qJobLoc: '',
      qJobLocName: '',
      qAge: '/',
      qPref: '',
      qstar: '',
      qEduLevel: '',
      qHighestDegree: 0,
      qDegree: '',
      qResult: '',
      qGrade: '/',
      InsType: 'Local',
      qExp: '/',
      qBusiness: '',
      qLastUpdated: -1,
      qOrgType: '',
      qWorkArea: '',
      qvalSearchType: 1,
      qSortby: '',
      qSortType: '',
      qpgcl: '',
      qPgNo: 1,
      qTPgNo: '',
      qKeyword: '',
      qKeywordType: '',
      qFilter: 0,
      qFilterName: '',
      qwatchlist: '',
      qCurLoc: '',
      qPerLoc: '',
      qArmyPerson: 0,
      qkeywordfiltertype: '',
      foreigninstitute: 'Local',
      ApplicantName: '',
      qSalary: '/',
      InsName: '',
      qPWD: 0,
      qEduTitle: '',
      reqCount: 1,
      immediateAvailable: 0
    };

    const mergedParams = { ...defaultParams, ...params };

    return this.http.get<SearchCountResponse>(url, { params: mergedParams })
      .pipe(
        map(response => {
          return {
            categories: this.mapCategories(response.catIds),
            eduLevels: this.mapEduLevels(response.eduLevels),
            courses: this.mapCourses(response.majosSubject),
            industries: this.mapIndustries(response.industries),
          }
        })
      );
  }
  mapCategories(categoryObj: Record<string, number>): SelectItem[] {
    if (!categoryObj) {
      return [];
    }
    return Object.entries(categoryObj)
      .map(([id, count]) => {
        return {
          value: parseInt(id),
          label: CATEGORY_MAP[id] || `Category ${id}`,
          count: count
        };
      })
      .filter(category => category.label !== undefined)
      .sort((a, b) => a.label.localeCompare(b.label));
  }


    mapEduLevels(eduLevelsObj: Record<string, number>): SelectItem[] {
      if (!eduLevelsObj) {
        return [];
      }
      
      return Object.entries(eduLevelsObj)
        .map(([id, count]) => {
          const matchingLevel = DegreeLevel.find(level => level.value === parseInt(id));
          return {
            value: parseInt(id),
            label: matchingLevel?.label || `Education Level ${id}`, 
            count: count
          };
        })
        .filter(eduLevel => eduLevel.label !== undefined); 
    }

    mapCourses(coursesObj: Record<string, number>): SelectItem[] {
      if (!coursesObj) {
        return [];
      }
      
      return Object.entries(coursesObj)
        .map(([key, count]) => {
          return {
            value: key,
            label: key, 
            count: count
          };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }

    mapIndustries(industriesObj: Record<string, number>): SelectItem[] {
      if (!industriesObj) {
        return [];
      }
      
      return Object.entries(industriesObj)
        .map(([key, count]) => {
          return {
            value: key,
            label: key, 
            count: count
          };
        }) .sort((a, b) => a.label.localeCompare(b.label));
    }

    generateSaveCvFilterUrl(filterData: FilterForm): string {
      const baseUrl = "https://corporate3.bdjobs.com/Save_Cv_Filter.asp";
      
      const paramNames: string[] = [];
      const paramValues: string[] = [];
      
      if (filterData.category && filterData.category.length) {
        paramNames.push('CatId');
        paramValues.push(filterData.category[0].value.toString());
      }
      
      if (filterData.ageRange && filterData.ageRange.length === 2) {
        paramNames.push('qAge');
        paramValues.push(filterData.ageRange.join('/'));
      }
      
      if (filterData.gender) {
        paramNames.push('qSex');
        paramValues.push(getGenderQueryValue(filterData.gender));
      }
      
      if (filterData.location && filterData.location.length) {
        paramNames.push('qJobLoc');
        paramValues.push(filterData.location.map(loc => loc.value).join(','));
        
        if (filterData.isCurrentLocation) {
          paramNames.push('qCurLoc');
          paramValues.push(filterData.location.map(loc => loc.value).join(','));
        }
        
        if (filterData.isPermanentLocation) {
          paramNames.push('qPerLoc');
          paramValues.push(filterData.location.map(loc => loc.value).join(','));
        }
        
        if (filterData.isPreferredLocation) {
          paramNames.push('qJobLocName');
          paramValues.push(filterData.location.map(loc => loc.value).join(','));
        }
      }
      
      if (filterData.experience && filterData.experience.length === 2) {
        paramNames.push('qExp');
        paramValues.push(filterData.experience.join('/'));
      }
      
      if (filterData.expectedSalary && filterData.expectedSalary.length === 2) {
        paramNames.push('qSalary');
        paramValues.push(filterData.expectedSalary.join('/'));
      }
      
      if (filterData.keyword) {
        paramNames.push('qKeyword');
        paramValues.push(filterData.keyword);
        
        const keywordFilters: number[] = [];
        if (filterData.isEducation) keywordFilters.push(2);
        if (filterData.isExperience) keywordFilters.push(3);
        if (filterData.isSkills) keywordFilters.push(4);
        
        if (keywordFilters.length) {
          paramNames.push('qkeywordfiltertype');
          paramValues.push(keywordFilters.join(','));
        }
      }
      
      const jobLevels: string[] = [];
      if (filterData.isEntry) jobLevels.push('Entry');
      if (filterData.isMid) jobLevels.push('Mid');
      if (filterData.isTop) jobLevels.push('Top');
      
      if (jobLevels.length) {
        paramNames.push('qPref');
        paramValues.push(jobLevels.join(','));
      }
      
      if (filterData.education) {
        paramNames.push('qEduLevel');
        paramValues.push(filterData.education.toString());
        
        if (filterData.isHighestDegree) {
          paramNames.push('qHighestDegree');
          paramValues.push('1');
        }
      }
      
      if (filterData.courses && filterData.courses.length) {
        paramNames.push('qDegree');
        paramValues.push(filterData.courses.map(c => c.label).join(','));
      }
      
      if (filterData.skills && filterData.skills.length) {
        paramNames.push('qOrgType');
        paramValues.push(filterData.skills.map(s => s.value).join(','));
      }
      
      if (filterData.expertise && filterData.expertise.length) {
        paramNames.push('qWorkArea');
        paramValues.push(filterData.expertise.map(ex => 
          `${ex.value}_${ex.extraParam ? ex.extraParam : 0}`).join(','));
      }
      
      if (filterData.industries && filterData.industries.length) {
        paramNames.push('qBusiness');
        paramValues.push(filterData.industries.map(ind => ind.label).join(','));
      }
      
      if (filterData.industryType && filterData.industryType.length) {
        if (paramNames.includes('qBusiness')) {
          const businessIndex = paramNames.indexOf('qBusiness');
          paramValues[businessIndex] += `,${filterData.industryType[0].value}`;
        } else {
          paramNames.push('qBusiness');
          paramValues.push(filterData.industryType[0].value);
        }
      }
      
      if (filterData.institutes && filterData.institutes.length) {
        paramNames.push('InsName');
        paramValues.push(filterData.institutes.map(inst => inst.label).join(','));
      }
      
      if (filterData.isRetiredArmy) {
        paramNames.push('qArmyPerson');
        paramValues.push('1');
      }
      
      if (filterData.personsWithDisabilities) {
        paramNames.push('qPWD');
        paramValues.push('1');
      }
      
      if (filterData.immediateAvailable) {
        paramNames.push('immediateAvailable');
        paramValues.push('1');
      }
      
      if (filterData.showStarCandidates) {
        paramNames.push('qstar');
        paramValues.push('1');
      }
      
      const url = new URL(baseUrl);
      
      if (paramNames.length > 0) {
        url.searchParams.append('n', paramNames.join('|^'));
        url.searchParams.append('v', paramValues.join('|^'));
      }
      
      
      url.searchParams.append('domain', 'test');
      
      return url.toString();
    }

  saveFilter(
    filterData: FilterForm,
    criteriaName: string,
    isNewFilter: boolean = true,
    criteriaId?: number | null
  ): Observable<any> {
    const url = environment.apiUrl + "/CvBankInsights/CvBankSavedFilter";
    const payload = this.buildSaveFilterPayload(
      filterData,
      criteriaName,
      isNewFilter,
      criteriaId ?? undefined
    );
    return this.http.post(url, payload);
  }

  private buildSaveFilterPayload(
    filterData: FilterForm,
    criteriaName: string,
    isNewFilter: boolean,
    criteriaId?: number
  ): SaveFilterRequest {
    const parameters: Record<string, string> = {};

    if (filterData.keyword) {
      parameters['qKeyword'] = filterData.keyword;

     const keywordFilters: string[] = [];
      if (filterData.isEducation) keywordFilters.push('2');
      if (filterData.isExperience) keywordFilters.push('3');
      if (filterData.isSkills) keywordFilters.push('4');

      if (keywordFilters.length) {
        parameters['qkeywordfiltertype'] = keywordFilters.join(',');
      }
    }

   if (filterData.ageRange?.length === 2 && !(filterData.ageRange[0] === MaxAgeRange[0] && filterData.ageRange[1] === MaxAgeRange[1] )) {
      parameters['qAge'] = filterData.ageRange.join('/');
    }

    if (filterData.experience?.length === 2 && !(filterData.experience[0] === MaxExpRange[0] && filterData.experience[1] === MaxExpRange[1] )) {
      parameters['qExp'] = filterData.experience.join('/');
    }

    if (filterData.expectedSalary?.length === 2 && !(filterData.expectedSalary[0] === MaxSalaryRange[0] && filterData.expectedSalary[1] === MaxSalaryRange[1] )) {
      parameters['qSalary'] = filterData.expectedSalary.join('/');
    }

    if (filterData.currentSalary?.length === 2) {
      parameters['qCurrentSalary'] = filterData.currentSalary.join('/');
    }

    if (filterData.gender) {
      parameters['qSex'] = getGenderQueryValue(filterData.gender);
    }

    if (filterData.category?.length) {
      parameters['CatId'] = filterData.category[0].value.toString();
      parameters['CatName'] = filterData.category[0].label;
    }

    const jobLevels: string[] = [];
    if (filterData.isEntry) jobLevels.push('Entry');
    if (filterData.isMid) jobLevels.push('Mid');
    if (filterData.isTop) jobLevels.push('Top');

    if (jobLevels.length) {
      parameters['qPref'] = jobLevels.join(',');
    }

    if (filterData.immediateAvailable) parameters['immediateAvailable'] = '1';
    if (filterData.showStarCandidates) parameters['qstar'] = '1';
    if (filterData.personsWithDisabilities) parameters['qPWD'] = '1';
    if (filterData.isRetiredArmy) parameters['qArmyPerson'] = '1';
    if (filterData.videoCV) parameters['videoCV'] = '1';

    if (filterData.location?.length) {
      const locationValues = filterData.location.map(loc => loc.value).join(',');
      parameters['qJobLoc'] = locationValues;

      if (filterData.isCurrentLocation) parameters['qCurLoc'] = locationValues;
      if (filterData.isPermanentLocation) parameters['qPerLoc'] = locationValues;
      if (filterData.isPreferredLocation) parameters['qJobLocName'] = locationValues;
    }

    if (filterData.education !== null) {
      parameters['qEduLevel'] = filterData.education.toString();
    }

    if (filterData.isHighestDegree) {
      parameters['qHighestDegree'] = '1';
    }

    if (filterData.courses?.length) {
      parameters['qDegree'] = filterData.courses.map(c => c.label).join(',');
    }

    if (filterData.skills?.length) {
      parameters['qOrgType'] = filterData.skills.map(s => s.value).join(',');
    }

    if (filterData.expertise?.length) {
      parameters['qWorkArea'] = filterData.expertise.map(ex =>
        `${ex.value}_${ex.extraParam ? ex.extraParam * 12 : 0}`).join(',');
    }

    let businessQuery = '';
    if (filterData.industries?.length) {
      businessQuery = filterData.industries.map(ind => ind.label).join(',');
    }

    if (filterData.industryType?.length) {
      if (businessQuery && !businessQuery.includes(filterData.industryType[0].value)) {
        businessQuery += `,${filterData.industryType[0].value}`;
      } else if (!businessQuery) {
        businessQuery = filterData.industryType[0].value;
      }
    }

    if (businessQuery) {
      parameters['qBusiness'] = businessQuery;
    }

    if (filterData.institutes?.length) {
      parameters['InsName'] = filterData.institutes.map(inst => inst.label).join('__');
    }

    if (filterData.shortlist) {
      parameters['qwatchlist'] = filterData.shortlist.id;
    }

    if (filterData.lastUpdated) {
      parameters['qLastUpdated'] = filterData.lastUpdated;
    }

    if (filterData.examTitle) {
      parameters['qEduTitle'] = filterData.examTitle;
    }
    const totalCvCount = this.getTotalCvCount();

    const payload: SaveFilterRequest = {
      isInsert: isNewFilter ? 1 : 2,
      cpId: this.getUserCompanyId(),
      criteriaName: criteriaName,
      parameters: parameters,
      cvCount: totalCvCount,
    };

    if (!isNewFilter && criteriaId !== undefined) {
      payload.criteriaId = criteriaId;
    }

    return payload;
  }

  private getUserCompanyId(): string {
    return this.localStorageService.getItem(CompanyIdLocalStorage) || '';
  }

  private getTotalCvCount(): number {
     return this.filterStore.totalCvCount() || 0;
  }

}

function getGenderQueryValue(gender: string): string {
  switch (gender) {
    case 'Male': return 'M';
    case 'Female': return 'F';
    case 'Other': return 'O';
    default: return '';
  }
}

export interface Location {
  display: null | string;
  locId: number;
  locName: string;
  prId: number;
  regionalId: number;
}