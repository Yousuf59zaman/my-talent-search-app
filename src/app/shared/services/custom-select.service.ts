import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/response';
import { VanueEditUpdateRequest, Venue } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomSelectService {
  http = inject(HttpClient);
  constructor() { }

  reqUrl: string = environment.baseUrl + 'recruitmentcenter/API/Schedule/';
  
  getVenueData(payload: {companyID: string, userID: number}):Observable<ApiResponse<Venue[]>>{
    return this.http.get(this.reqUrl+'GetVenueData/', {params: payload})
  }

  editUpdateVanueData(payload: VanueEditUpdateRequest): Observable<ApiResponse<any>>{
    return this.http.post(this.reqUrl+'ScheduleVenueAddEdit/', payload)
  }
}
