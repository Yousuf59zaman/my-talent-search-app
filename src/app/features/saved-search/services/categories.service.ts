import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../../../shared/models/response';
import { map } from 'rxjs';
import { AllCategories, CategoryByIdData } from '../model/allCategory.model';
import { CATEGORY_MAP } from '../../filter-panel/models/filter-datamodel';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private http:HttpClient) { }

  getAllCategories(CompanyId: string) {
    const url = `${environment.apiUrl}/CVBank/CategoryCount`;
    const params = new HttpParams().set('CompanyId', CompanyId);

    return this.http.get<any>(url, { params }).pipe(
      map(res => Object.entries(res.catIds).map(([id, value]) => ({ 
        id: +id, 
        value: +(value as number),
        categoryName: CATEGORY_MAP[id] || `Category ${id}`
      })))
    );
  }
  
  getCategoryCountById({ CompanyId, CatId, qLastUpdated }: { CompanyId: string; CatId: string; qLastUpdated:string }) {
    const url = `${environment.apiUrl}/CVBank/CategoryCountById`;
    const params = new HttpParams()
      .set('CompanyId', CompanyId)
      .set('qLastUpdated',qLastUpdated)
      .set('CatId', CatId);

    return this.http.get<CategoryByIdData>(url, { params })
    .pipe(
      map((data)=>data)
    )
  }

}