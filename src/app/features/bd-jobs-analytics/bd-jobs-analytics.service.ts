import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { UserDeviceInfoService } from "../../core/services/user-device-info.service";
import { BdjAnalyticsApiResponse, CompanyName, LastUserType, LastUserTypes, UserId } from "../../shared/enums/app.enums";
import { LocalstorageService } from "../../core/services/essentials/localstorage.service";
import { map } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class BdJobsAnalyticsService {
  private http = inject(HttpClient);
  private userDeviceInfo = inject(UserDeviceInfoService)
  private url = 'https://bdjobs-anlytics-engine-odcx6humqq-as.a.run.app/api/BdjAnalytics'
  private localStorageService = inject(LocalstorageService);

  sendDeviceInfoToServer(activityType: string, activity: number, activityName: string) {
      const payload = {
          userId:this.localStorageService.getItem(UserId),
          userName : this.localStorageService.getItem(CompanyName),
          childUserId: '',
          childUserName: '',
          userType : +this.localStorageService.getItem(LastUserType) === +LastUserTypes.Corporate ? 2 : 1,
          activityType,
          activity,
          activityName,
          ipAddress: this.userDeviceInfo.getUserDeviceInfo().ipAddress?? '',
          macAddress: this.userDeviceInfo.getUserDeviceInfo().macAddress ?? '', 
          location: this.getFormattedLocation() ?? '',
          os: this.userDeviceInfo.getUserDeviceInfo().operatingSystem ?? '' ,
          ram: this.userDeviceInfo.getUserDeviceInfo().ram ?? '',
          screenSize: this.userDeviceInfo.getUserDeviceInfo().screenSize ?? '',
          bandwidth: this.userDeviceInfo.getUserDeviceInfo().bandwidth ?? '',
          browser: this.userDeviceInfo.getUserDeviceInfo().browser ?? '',
          device: +(this.userDeviceInfo.getUserDeviceInfo().device ?? 0)
      };

      return this.http.post<BdjAnalyticsApiResponse> (this.url, payload).pipe(
        map((res: BdjAnalyticsApiResponse) => res.eventData)
      )
  }

  getFormattedLocation(): string {
  const loc = this.userDeviceInfo.getUserDeviceInfo().location;
  if (!loc) return '';
  const latitude = loc.latitude ?? '';
  const longitude = loc.longitude ?? '';
  return latitude && longitude ? `${latitude},${longitude}` : '';
}

}