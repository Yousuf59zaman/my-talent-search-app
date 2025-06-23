import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { CookieService } from '../cookie/cookie.service';
import {
  BdjobsUrl,
  CompanyLogoUrl,
  CompanyName,
  Cookies,
  CorporateSession,
  CreateCompanyId,
  IsAdminUser,
  IsCorporateUser,
  LastUserType,
  LastUserTypes,
  MybdjobsPanelUrl,
  MybdjobsUserApiResponse,
  MybdjobsUserApiResponseType,
  RecruiterDashboard,
  RecruiterPanelUrl,
  SupportingInfo,
  UserId,
  UserType,
} from '../../../shared/enums/app.enums';
import { redirectExternal } from '../../../shared/utils/functions';
import { LocalstorageService } from '../essentials/localstorage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode} from 'jwt-decode';
import { CompanyId, CvBankJwtPayload } from '../../../shared/utils/app.const';
import { NavDataStore } from '../../layouts/nav/services/nav-data.store';
import { ModalService } from '../modal/modal.service';
import { CompanyVerifyModalComponent } from '../../../features/modal/company-verify-modal/company-verify-modal.component';
import { filter, Subscription, Observable, of, map, switchMap, BehaviorSubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private localStorageService = inject(LocalstorageService);
  private navStore = inject(NavDataStore);
  private httpClient = inject(HttpClient)
  private cookieService = inject(CookieService)
  private modalService = inject(ModalService);
  private destroy$ = inject(DestroyRef); 
  private isAuthenticated = signal<boolean>(false);
  nidVerify = signal<boolean>(false);
  verificationStatus = signal<boolean>(false);
  inSideBangladesh = signal<boolean>(false);
  paymentProcess = signal<boolean>(false);
  public isAuthenticatedUser = computed(() => this.isAuthenticated());
  public userType = signal<UserType>(null);
  private modalCloseSubscription: Subscription | null = null;
  private readonly GET_SUPPORTING_INFO_ENDPOINT: string =
    'https://api.bdjobs.com/auth/api/Login/GetSupportingInfo';

  redirectToRecruiterApp = () => redirectExternal(RecruiterPanelUrl);
  redirectToMybdjobsApp = () => redirectExternal(MybdjobsPanelUrl)
  redirectToRecruiterDashboard = () => redirectExternal(RecruiterDashboard);
  redirectToBdjobs = () => redirectExternal(BdjobsUrl);

  private userSubject = new BehaviorSubject<SupportingInfo | null>(null);
  user$ = this.userSubject.asObservable();
  
  
  getRecturerUserInfo(){
    try {
      const token = this.cookieService.getCookie(Cookies.AUTH);
      if (token) {
        const decodedToken = this.decodeToken<CvBankJwtPayload>(decodeURI(token));
        if(decodedToken && decodedToken.CompanyId && decodedToken.UserId) {         
          this.localStorageService.setItem(CompanyId, decodedToken.CompanyId);
          this.localStorageService.setItem(UserId, decodedToken.UserId);
          this.localStorageService.setItem(IsCorporateUser,'true');
          this.setAuth(true);
          const headers = new HttpHeaders({
            Authorization: decodeURI(token),
          });
          this.httpClient.get<SupportingInfo>(this.GET_SUPPORTING_INFO_ENDPOINT, { headers }).subscribe({
            next: (res) => {
              if (res) {
                this.localStorageService.setItem(CompanyName,res.Name)
                this.localStorageService.setItem(CompanyLogoUrl,res.CompanyActiveLogoURL)
                this.navStore.setCompanyInfo(res.Name, res.CompanyActiveLogoURL || 'images/default-company.png');
                this.nidVerify.set(res.NidVerify)
                this.verificationStatus.set(res.VerificationStatus)
                this.paymentProcess.set(res.PaymentProcess)
                this.localStorageService.setItem(LastUserType, LastUserTypes.Corporate);
                this.localStorageService.setItem(IsAdminUser, res.AdminUserType.toString());
                this.userSubject.next(res);
                if (res.CompanyCountry === 'Bangladesh') {
                  this.inSideBangladesh.set(true)
                } else {
                  this.inSideBangladesh.set(false)
                }
              }
            }
          })
        } else {
          this.localStorageService.setItem(LastUserType, LastUserTypes.None);
          this.setAuth(false);
          this.redirectToRecruiterApp();
        }
      }
    } catch (error) {
      this.redirectToRecruiterApp();
    }
  }

  private setAuth(isAuthenticated: boolean) {
    this.isAuthenticated.set(isAuthenticated);
  }
  
  private decodeToken<T>(token: string): T {
    try {
      return jwtDecode<T>(token);
    } catch (error) {
      throw new Error('Error decoding JWT');
    }
  }

  isVerified() {
    if (this.localStorageService.getItem(IsCorporateUser)) {
      if (((this.nidVerify() || this.verificationStatus() || this.paymentProcess()) && this.inSideBangladesh()) || !this.inSideBangladesh()) {
        return true;
      } else {
        this.setAuth(false)
        this.modalService.setModalConfigs({
          attributes: {
            modalWidth: '500px',
          },
          componentRef: CompanyVerifyModalComponent,
        });
        this.listenOnModalClose();
        return false
      }
    }
    return true
  }

  private listenOnModalClose(): void {
    if (this.modalCloseSubscription) {
      this.modalCloseSubscription.unsubscribe();
    }
    this.modalCloseSubscription = this.modalService.onCloseModal$
      .pipe(
        takeUntilDestroyed(this.destroy$), 
        filter((isClose) => isClose) 
      )
      .subscribe({
        next:() => this.redirectToRecruiterDashboard()
      });
  }

  hasRecruiterAuthToken(): boolean {
    return !!this.cookieService.getCookie(Cookies.AUTH);
  }

  hasMybdjobsUserId(): boolean {
    return !!this.cookieService.getCookie(Cookies.MybdjobsUserId);
  }

  resolveJobseekerCompanyId(): Observable<boolean> {
    const MybdjobsUserId = this.cookieService.getCookie(Cookies.MybdjobsUserId);
    if (!MybdjobsUserId) return of(false);
    const jobSeekerUserId = decodeURIComponent(MybdjobsUserId);
    if (!jobSeekerUserId) return of(false);
    const payload = { jobSeekerUserId };
    return new Observable<boolean>((observer) => {
      this.httpClient.post<MybdjobsUserApiResponse<CreateCompanyId>[]>('https://c2c-development-apis-01-odcx6humqq-as.a.run.app/api/c2c/createCompanay', payload)
        .subscribe({
          next: (response) => {
            const eventData = response[0];
            if (eventData && eventData.eventType === MybdjobsUserApiResponseType.SuccessResponse) {
              this.setAuth(true);
              this.localStorageService.setItem(LastUserType, LastUserTypes.Jobseeker);
              this.localStorageService.setItem(CompanyId, eventData.eventData[0].value.companyId);
              this.localStorageService.setItem(UserId, eventData.eventData[0].value.userId);
              this.localStorageService.setItem(CompanyName, eventData.eventData[0].value.companyName);
              this.localStorageService.setItem(CompanyLogoUrl, eventData.eventData[0].value.photoUrl);
              this.localStorageService.setItem(IsCorporateUser, 'false');
              this.setRecruiterSession(eventData.eventData[0].value.userId, eventData.eventData[0].value.companyId);
              this.navStore.setCompanyInfo(eventData.eventData[0].value.companyName, eventData.eventData[0].value.photoUrl || 'images/default-company.png');
              observer.next(true);
              observer.complete();
            } else {
              this.localStorageService.setItem(LastUserType, LastUserTypes.None);
              this.setAuth(false);
              observer.next(false);
              observer.complete();
            }
          },
          error: () => {
            this.localStorageService.setItem(LastUserType, LastUserTypes.None);
            this.setAuth(false);
            observer.next(false);
            observer.complete();
          }
        });
    });
  }

  setRecruiterSession(userId: string, companyId: string): void {
    const payload = {
      "userid": userId,
      "companyId": companyId,
      "systemId": 2,
      "isFromMis": true
    }

    this.httpClient.post<{event: MybdjobsUserApiResponse<CorporateSession>}>(
      'https://api.bdjobs.com/auth/api/Login/ServicesAuth', 
      payload,
      {
        withCredentials: true,
      }
    )
    .pipe(
      takeUntilDestroyed(this.destroy$),
      filter(res => res && res.event.eventType === MybdjobsUserApiResponseType.SuccessResponse),
      switchMap(() => this.getJobseekerSupportingData(companyId, userId))
    )
    .subscribe()
  }

  getJobseekerSupportingData(companyId: string, userId: string) {
    return this.httpClient.get(`https://corporate3.bdjobs.com/SupportingData-test.asp?ComID=${companyId}&ComUsrAcc=${userId}`, {
        withCredentials: true,
      })
  }
  
}