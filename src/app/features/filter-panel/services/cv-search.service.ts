import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { FilterForm } from '../models/form.models';
import { QueryBuilder } from './query-builder';
import { CompanyId } from '../../../shared/utils/app.const';
import { CvBankApplicantResponse } from '../../applicant/models/applicant.model';

@Injectable({
  providedIn: 'root',
})
export class CvSearchService {
  private http = inject(HttpClient);
  private localStorageService = inject(LocalstorageService);

  getCVs(filterform: FilterForm, pageNo: number = 1): Observable<CvBankApplicantResponse> {
    let endPoint = '/CVBank';
    const payload = new QueryBuilder(filterform, this.localStorageService.getItem(CompanyId) || '', pageNo);
    const baseUrl = 'https://gateway.bdjobs.com/cvbank/api' + endPoint;
    return this.http.get<CvBankApplicantResponse>(baseUrl, { params: payload as any })
      .pipe(
        filter(res => res.error === '0' && res.message === 'success'),
        catchError(() => of({} as CvBankApplicantResponse)),
      )
  }

  getCVCount(filterform: FilterForm): Observable<{starCvCount: number, totalCvCount: number}> {
    let endPoint = '/CVBank/filteredcount';
    const payload = new QueryBuilder(filterform, this.localStorageService.getItem(CompanyId) || '');
    const baseUrl = environment.apiUrl + endPoint;
    return this.http
      .get(baseUrl, { params: payload as any })
      .pipe(map((data: any) => (data ? data : data)))
  }
}
