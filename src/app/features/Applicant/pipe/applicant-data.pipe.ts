import { computed, inject, Pipe, PipeTransform } from '@angular/core';
import { Applicant } from '../models/applicant.model';
import { NavDataService } from '../../../core/services/nav-data.service';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { IsCorporateUser } from '../../../shared/enums/app.enums';

@Pipe({
  name: 'applicantPrivacy',
  standalone: true
})
export class ApplicantDataPipe implements PipeTransform {
  private navDataService = inject(NavDataService);
  private localStorageService = inject(LocalstorageService);

  CvBankSearchAccess = computed(() => this.navDataService.navData()?.cvSearchAccess === true);
  cvbankAccessLimitExpired = computed(() => this.navDataService.cvbankAccessLimitExpired());

  transform(applicant: Applicant, field: 'name' | 'phone' | 'email' | 'photo' | 'location'): string {
    if (!applicant) return '';
    let actualValue = '';
    switch (field) {
      case 'name':
        actualValue = applicant.applicantName || '';
        break;
      case 'phone':
        actualValue = this.extractPhone(applicant);
        break;
      case 'email':
        actualValue = this.extractEmail(applicant);
        break;
      case 'photo':
        const photoUrl = applicant.photo;
        if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
          actualValue = photoUrl;
        } else {
          actualValue = 'images/Avatar.png';
        }
        break;
      case 'location':
        actualValue = this.extractLocation(applicant);
        break;
      default:
        actualValue = '';
    }

    const isCorporateUser = this.localStorageService.getItem(IsCorporateUser) === 'true';

    if (isCorporateUser) {
      if (applicant.isBlueCollarCat === 1) {
        return actualValue;
      } else if (this.CvBankSearchAccess()) {
        if (this.cvbankAccessLimitExpired()) {
          if (applicant.resumeViewedAlready) {
            return actualValue;
          }
        }
        else {
          return actualValue;
        }
      } else {
        if (applicant.isPurchased) {
          return actualValue;
        }
      }
    }
    else {
      if (applicant.isPurchased) {
        return actualValue;
      }
    }

    switch (field) {
      case 'name':
        return applicant.applicantBlurName || 'Candidate Name';
      case 'phone':
        return '+880 1XXX-XXXXXX';
      case 'email':
        return 'candidate@example.com';
      case 'photo':
        return 'images/Avatar.png';
      case 'location':
        return 'Somewhere, Bangladesh';
      default:
        return '';
    }
  }

  private extractPhone(applicant: Applicant): string {
    if (!applicant) return '';

    const mobiles = applicant.mobiles;

    if (!mobiles || !Array.isArray(mobiles) || mobiles.length === 0) {
      return '';
    }

    const validMobiles = mobiles.filter(m => m !== null);
    const validMobile = validMobiles.find(m =>
      m && typeof m === 'object' && 'mobileNo' in m && !!m.mobileNo && m.mobileNo.trim() !== ''
    );

    return validMobile?.mobileNo ?? '';
  }

  private extractEmail(applicant: Applicant): string {
    const emails = applicant?.emails;
    if (emails && Array.isArray(emails) && emails.length > 0 && emails[0]?.emailAddress) {
      return emails[0].emailAddress;
    }
    return '';
  }

  private extractLocation(applicant: Applicant): string {
    const addresses = applicant?.address;
    if (addresses && Array.isArray(addresses) && addresses.length > 0) {
      const fullAddress = addresses[0]?.fullAddress;
      if (fullAddress) {
        const addressParts = fullAddress.split(',');
        if (addressParts.length >= 2) {
          return `${addressParts[0].trim()}, ${addressParts[addressParts.length - 1].trim()}`;
        }
        return fullAddress;
      }
    }
    return '';
  }
}