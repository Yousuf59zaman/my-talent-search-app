import { inject, Injectable } from '@angular/core';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { EduSubject, IndustryType } from '../model/search-talent.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/response';
import { ResponseType } from '../../../shared/enums/app.enums';

@Injectable({
  providedIn: 'root',
})
export class SearchTalentService {
  private http = inject(HttpClient);

  getEduSubjectSuggestions(): Observable<EduSubject[]> {
    return this.http
      .get<ApiResponse<any[]>>(
        environment.baseUrl + 'CVBankSupport/api/LeftPanel/GetMajors'
      )
      .pipe(
        filter((res) => res.responseType === ResponseType.Success),
        map((res) =>
          !res.data || res.data.length === 0
            ? []
            : res.data.map((item: any) => {
                return {
                  eduSubjectID: item.majorSubjectId,
                  displayName: item.majorSubjectName,
                };
              })
        ),
        catchError(() => of([]))
      );
  }

  getIndustryTypeSuggestions(): Observable<IndustryType[]> {
    return this.http
      .get<ApiResponse<any[]>>(
        environment.baseUrl +
          'CVBankSupport/api/LeftPanel/GetIndustryTypeByName'
      )
      .pipe(
        filter((res) => res.responseType === ResponseType.Success),
        map((res) =>
          !res.data || res.data.length === 0
            ? []
            : res.data.map((item: any) => {
                return {
                  industryTypeID: item.orG_TYPE_ID,
                  displayName: item.orG_TYPE_NAME,
                };
              })
        ),
        catchError(() => of([]))
      );
  }
}
