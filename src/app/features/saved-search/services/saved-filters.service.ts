import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { EditSaveFilterInputRequestBody, SavedFilterApiResponse,  SavedSearchCard } from '../model/saved-filters.model';
import { ApiResponse } from '../../../shared/models/response';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SavedFiltersService {

  constructor(private http: HttpClient) { }

  getCVBankSavedFilter(CompanyId:string){
    const url = `${environment.apiUrl}/CvBankInsights/GetCvBankSavedFilter`
    const params = new HttpParams()
      .set('CompanyId', CompanyId)

    return this.http.get(url, { params })
      .pipe(
        map((res: ApiResponse<SavedFilterApiResponse[]>) => res.data as SavedFilterApiResponse[]),
        map(data => data.map((data) => new SavedSearchCard({...data, type: 'SavedFilter'}))))
  }

  submitSavedFilterName(reqBody:EditSaveFilterInputRequestBody) {
    const editInputUrl =  `${environment.apiUrl}/CvBankInsights/CvBankSavedFilter`;
    return this.http.post<ApiResponse<any>>(editInputUrl,reqBody);
  }
  
  deleteSavedFilter(query:{id: string}) {
    const deleteUrl = `${environment.apiUrl}/CvBankInsights/CvBankSavedFilterDelete`;
    return this.http.post<ApiResponse<any>>(deleteUrl,query);
  }
}
