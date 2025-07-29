import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { NavResponse } from '../class/navbarResponse';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private http: HttpClient) { }

  getNavbarData(payload:{companyId:string, userId:string}): Observable<NavResponse> {
    const baseUrl = 'https://recruiter.bdjobs.com/authentication/api/services';
    return this.http.post<NavResponse>(baseUrl,payload)
      .pipe(
        map((response: NavResponse) => {
          return {
            ...response,
            data: {
              ...response.data,
              cvSearchAccess: isDevMode() ? response.data.cvSearchAccess : response.data.cvSearchAccess,
              cvSearchService: isDevMode() ? 
              {
                available: -1,
                endingDate: "2025-05-1 00:00:00",
                id: 31823,
                limit: 15,
                startingDate: "2025-04-1 00:00:00",
                viewed: 16
              } : response.data.cvSearchService
            }
          };
        })
      )
  }
}
