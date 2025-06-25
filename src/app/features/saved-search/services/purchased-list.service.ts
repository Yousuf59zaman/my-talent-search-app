import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { map } from 'rxjs';
import { ApiResponse } from '../../../shared/models/response';
import { EditPurchasedListInputRequestBody, PurchasedList } from '../model/purchased-list.model';

@Injectable({
  providedIn: 'root'
})
export class PurchasedListService {

  constructor(private http: HttpClient) { }

  getPurchasedList(CompanyId:string){
    const url = `${environment.apiUrl}/CvBankInsights/GetPurchaselist`
    const params = new HttpParams()
    .set("CompanyId",CompanyId)

    return this.http.get(url,{params})
    .pipe(map ((data:ApiResponse<PurchasedList[]>) => data.data?.map((data) =>{
      return data as PurchasedList
    })))
  }
  submitPurchasedListEdit(reqBody:EditPurchasedListInputRequestBody) {
        const editInputUrl =  `${environment.apiUrl}/CvBankInsights/CvBankPurchaseList`;
        return this.http.post<ApiResponse<any>>(editInputUrl,reqBody);
      }

  deletePurchasedList(query:{id: string , ListID:number}) {
    const deleteUrl = `${environment.apiUrl}/CvBankInsights/CvBankPurchaseListDelete`;
    return this.http.post<ApiResponse<any>>(deleteUrl,query);
  }
}
