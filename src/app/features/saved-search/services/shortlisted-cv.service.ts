import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { EditShortlistedInputRequestBody, SavedSearchCard, ShortlistedCvApiResponse } from '../model/saved-filters.model';
import { ApiResponse } from '../../../shared/models/response';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ShortlistedCvService {

  constructor(private http: HttpClient) { }

  getCvBankShortlist(companyId:string){
    const url = `${environment.apiUrl}/CvBankInsights/GetCvBankShortlist`
    const params = new HttpParams()
    .set("CompanyId",companyId)
    
    return this.http.get(url, { params })
          .pipe(
            map((res: ApiResponse<ShortlistedCvApiResponse[]>) => res.data as ShortlistedCvApiResponse[]),
            map(data => data.map((data) => new SavedSearchCard({...data, type: 'ShortlistedCv'}))))
  }
  submitShortlistedEdit(reqBody:EditShortlistedInputRequestBody) {
      const editInputUrl =  `${environment.apiUrl}/CvBankInsights/CvBankShortlist`;
      return this.http.post<ApiResponse<any>>(editInputUrl,reqBody);
    }
  deleteShortlistedCv(query:{id: string}) {
    const deleteUrl = `${environment.apiUrl}/CvBankInsights/CvBankShortlistDelete`;
    return this.http.post<ApiResponse<any>>(deleteUrl,query);
  }
}
