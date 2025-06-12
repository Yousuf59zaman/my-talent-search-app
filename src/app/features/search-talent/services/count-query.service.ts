import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ISearchCountForm, ISearchCountQueryRes } from "../model/search-talent.models";
import { LocalstorageService } from "../../../core/services/essentials/localstorage.service";
import { environment } from "../../../../environments/environment";
import { CompanyIdLocalStorage } from "../../../shared/enums/app.enums";

@Injectable()

export class CountQueryService {
  private http = inject(HttpClient);
  private localStorage = inject(LocalstorageService);

  getCountQueryParam(searchForm: ISearchCountForm) {
    const queryParamObj = new CountQueryParam(
      searchForm,
      this.localStorage.getItem(CompanyIdLocalStorage)
    );
    const queryParam = queryParamObj.toDefinedObject();
    return this.http.get<ISearchCountQueryRes>(
      environment.apiUrl + '/CVBank/filteredcount',
      { params: queryParam as any }
    );
  }
}

export class CountQueryParam {
    catId?: string;
    catName?: string;
    qSex?: string;
    qJobLoc?: string;
    qJobLocName?: string;
    qAge: string | null = '/';
    qPref?: string;
    qstar = 'undefined';
    foreigninstitute = 'Local';
    qEduLevel?: string;
    qHighestDegree = '0';
    qDegree?: string;
    qResult?: string;
    qGrade = '/';
    qSalary: string | null = '/';
    insType = 'Local';
    insName?: string;
    qExp: string | null = '/';
    qBusiness?: string;
    qLastUpdated = '-1';
    qOrgType?: string;
    qWorkArea?: string;
    qvalSearchType = '1';
    qSortby?: string;
    qSortType?: string;
    qpgcl?: string;
    qPgNo = '1';
    qTPgNo?: string;
    qKeyword?: string;
    qKeywordType?: string;
    qFilter = '0';
    qFilterName?: string;
    qwatchlist?: string;
    qCurLoc?: string;
    qPerLoc?: string;
    qArmyPerson = '0';
    qkeywordfiltertype?: string;
    qPWD = '0';
    qEduTitle?: string;
    companyId: string;
    applicantName?: string;
    reqCount = '0';
    immediateAvailable = '0';

    constructor(data: ISearchCountForm, companyId: string) {
        this.companyId = companyId;
        if (data.keyWords) {
            this.qKeyword = data.keyWords;
        }
        if (data.age) {
            this.qAge = (data.age.length > 0 && data.age.join('/') === '20/50') ? null : data.age.join('/');
        }
        if (data.eduInstitute && data.eduInstitute.length > 0) {
            this.insName = data.eduInstitute[0].label.replaceAll(/,/g, ' ');
        }
        if (data.eduSubject && data.eduSubject.length > 0) {
            this.qDegree = data.eduSubject[0].value;
        }
        if (data.salary) {
            this.qSalary = (data.salary.length > 0 && data.salary.join('/') === '10000/300000') ? null : data.salary.join('/');    
        }
        if (data.expRange) {
            this.qExp = (data.expRange.length > 0 && data.expRange.join('/') === '0/20') ? null : data.expRange.join('/');
        }
        if (data.industryType && data.industryType.length > 0) {
            this.qBusiness = data.industryType[0].value;
        }
    }

    toDefinedObject() {
        const definedObject: { [key: string]: any } = {};
        for (const key in this) {
            if (this[key] !== undefined) {
                definedObject[key] = this[key];
            }
        }
        return definedObject;
    }
}