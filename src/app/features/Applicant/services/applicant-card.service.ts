import { computed, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse, CustomCvDownloadResponse } from '../../../shared/models/response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { CompanyIdLocalStorage, UserId } from '../../../shared/enums/app.enums';
import { environment } from '../../../../environments/environment';
import { DownloadCVRequest } from '../class/card-query-builder';
import { VideoResponse, SkillExperienceResponse, GetPurchaseListResponse, PurchaseList, ShortListData, ShortListedCvDeleteReqBody, PurchaseListCvDeleteReqbody } from '../models/applicant.model';
import { CompanyId } from '../../../shared/utils/app.const';

@Injectable({
  providedIn: 'root'
})
export class ApplicantCardService {
  isAlreadyAssigned = signal(false);
  isAlreadyAssignedToShortList = signal(false)
  purchaseListId = signal('');
  purchaseListNumericId = signal<number | null>(null);
  private recentlyAddedApplicants = signal<string[]>([]);
  public recentlyAddedApplicantsToShortListGroup = signal<string[]>([])
  shortListId = signal('')

  selectedListName = signal('');
  selectedListDescription = signal ('')
  selectedApplicantIds = signal<string[]>([]);
  selectedShortListName = signal('')
  selectedShortListDescription = signal('')
  selectedShortListCategoryId = signal<number | null>(null);

  currentCv = signal(0);
  wishlistCv = signal(0);
  totalCv = computed(() => this.currentCv() + this.wishlistCv());
  shortListCvCount = signal(0)
  shortListToastData = signal<{ name: string; count: number } | null>(null);

  currentTk = computed(() => {
    const cv = this.currentCv();
    if (cv === 0) return 0;
    if (cv <= 3) return 99;
    return 99 + (cv - 3) * 30;
  });

  totalTk = computed(() => {
    const cv = this.totalCv();
    if (cv === 0) return 0;
    if (cv <= 3) return 99;
    return 99 + (cv - 3) * 30;
  });

  // Reset all counts (call this when starting a new session)
  resetCounts(): void {
    this.currentCv.set(0);
    this.wishlistCv.set(0);
  }

  setSelectedPurchaseList(id: string, numericListId: number, name: string, description:string,) {
    this.purchaseListId.set(id);
    this.purchaseListNumericId.set(numericListId);
    this.selectedListName.set(name);
    this.selectedListDescription.set(description)
  }
  setSelectedShortList(id: string, name: string , description: string, categoryId:number | null = null) {
    this.shortListId.set(id);
    this.selectedShortListName.set(name);
    this.selectedShortListDescription.set(description)
    this.selectedShortListCategoryId.set(categoryId)
  }

  addApplicatToShortListGroupSelection(applicantId:string){
    this.recentlyAddedApplicantsToShortListGroup.update(ids => [...ids, applicantId]);
  }

  isInSelectedShortListId(applicantId: string): boolean {
    return this.recentlyAddedApplicantsToShortListGroup().includes(applicantId);
  }

  addApplicantToSelection(applicantId: string): void {
    this.recentlyAddedApplicants.update(ids => [...ids, applicantId]);

    this.selectedApplicantIds.update(ids => {
      if (!ids.includes(applicantId)) {
        return [...ids, applicantId];
      }
      return ids;
    });
  }

  clearApplicantSelection(): void {
    this.selectedApplicantIds.set([]);
  }

  constructor(private http: HttpClient, private localStorageService: LocalstorageService) { }

  downloadCV(query: DownloadCVRequest): Observable<CustomCvDownloadResponse> {
    const baseUrl = 'https://api.bdjobs.com/mybdjobs/v1/FileUpload/download_cv';
    const paramQuery = new HttpParams()
      .set('hID', query.hID)
      .set('hFileName', query.hFileName)
      .set('deviceType', query.deviceType)
      .set('userId', query.userId || '')
      .set('decodeid', query.decodeid || '');
    return this.http.post<CustomCvDownloadResponse>(baseUrl, paramQuery);
  }

  generateShortlistCvUrl(applicantId: string, applicantName: string): string {
    const baseUrl = 'https://corporate3.bdjobs.com/cv_short_list.asp';
    return `${baseUrl}?appids=${applicantId}&name=${encodeURIComponent(applicantName)}`;
  }

  getvideoCVDetails(applyid: string, serviceId: number, isPurchased: number = 0): Observable<ApiResponse<VideoResponse>> {
    const url = environment.baseUrl + 'recruitmentcenter/API/ApplicantCV/VideoCV';

    const params = new HttpParams()
      .set('UserID', this.localStorageService.getItem(UserId))
      .set('CompanyId', this.localStorageService.getItem(CompanyIdLocalStorage))
      .set('cvId', applyid)
      .set('serviceId', serviceId)
      .set('isPurchased', isPurchased.toString());

    return this.http.get<ApiResponse<VideoResponse>>(url, { params });
  }

  insertOrUpdateRating(applyId: string, rating: number): Observable<ApiResponse<any>> {
    const url = environment.baseUrl + 'recruitmentcenter/API/ApplicantCV/VideoCV/RatingLog';
    const params = {
      companyId: this.localStorageService.getItem(CompanyIdLocalStorage),
      userId: this.localStorageService.getItem(UserId),
      cvId: applyId,
      rating: rating
    }
    return this.http.post<ApiResponse<any>>(url, params);
  }

  getSkillExperience(payload: { applyId: string, companyID: string }): Observable<SkillExperienceResponse> {
    const baseUrl = 'https://corporate3.bdjobs.com/cv_search_skillworkareasView.asp';
    const params = new HttpParams({ fromObject: { ...payload, domain: 'test' } });
    return this.http.get<SkillExperienceResponse>(baseUrl, { params });
  }

  getPurchaseList() {
    const baseUrl = environment.apiUrl + '/CvBankInsights/GetPurchaseList';
    const params = new HttpParams()
      .set('CompanyID', this.localStorageService.getItem(CompanyId));
    // .set('CompanyID', "ZRLzZRdx")
    return this.http.get<ApiResponse<any>>(baseUrl, { params })
  }

  createNewPurchase(reqBody: PurchaseList): Observable<GetPurchaseListResponse> {
    const baseUrl = environment.apiUrl + '/CvBankInsights/CvbankPurchaseList';
    // params = new HttpParams().set('CompanyID', this.localStorageService.getItem(CompanyId));
    return this.http.post<any>(baseUrl, reqBody);
  }

  addApplictionToPurchaseList(reqBody: any) {
    const baseUrl = environment.apiUrl + '/CvBankInsights/CvbankPurchaseList';
    return this.http.post<ApiResponse<any>>(baseUrl, reqBody);
  }

  addCvToListFromJobSeeker(resumeId: string): Observable<any> {
    const url = 'https://corporate3.bdjobs.com/CvAddtoListFromJobSeeker.asp';
    const params = new HttpParams().set('resumeId', resumeId);

    return this.http.post<any>(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      withCredentials: true
    });
  }
  isInSelectedList(applicantId: string): boolean {
    return this.recentlyAddedApplicants().includes(applicantId);
  }

  getShortList(){
    const baseUrl = environment.apiUrl + '/CvBankInsights/GetCvBankShortlist';
    const params = new HttpParams()
      .set('CompanyID', this.localStorageService.getItem(CompanyId));
    return this.http.get<ApiResponse<ShortListData[]>>(baseUrl, { params })
    .pipe( map((res)=>res.data) )
  }

  addApplicantToShortList(reqBody: any){
    const baseUrl = environment.apiUrl + '/CvBankInsights/CvBankShortlist';
    return this.http.post<ApiResponse<any>>(baseUrl, reqBody);
  }

  showShortListToast(name: string, count: number) {
    this.shortListToastData.set({ name, count });
  }

  clearShortListToast() {
    this.shortListToastData.set(null);
  }

  removeFromShortListGroup(reqBody:ShortListedCvDeleteReqBody){
    const url = environment.apiUrl + '/CvBankInsights/ShortListedCVDelete'
    return this.http.post<ApiResponse<any>>(url, reqBody)
  }

  removeFromPurchaseList(reqBody:PurchaseListCvDeleteReqbody){
    const url = environment.apiUrl + '/CvBankInsights/PurchasedCVDelete'
    return this.http.post<ApiResponse<any>>(url, reqBody)
  }
}
