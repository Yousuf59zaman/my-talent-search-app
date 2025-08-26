
import { Applicant } from "../models/applicant.model";
import { decrypt, encrypt } from "../../../shared/utils/custom-encryption";
import { LocalstorageService } from "../../../core/services/essentials/localstorage.service";
import { CompanyIdLocalStorage, UserId } from "../../../shared/enums/app.enums";

export abstract class ApplicantCard {

  public static getCVDetailsLink(
    applicant: Applicant | null, isCorporate: boolean, storageService: LocalstorageService
  ): string {
  
    if (!applicant) return '';

    const encrypted = encodeURIComponent(encrypt({
      Idn: applicant.applicantId,
      purchasedCV: applicant.isPurchased && applicant.isPurchased > 0 ? applicant.isPurchased.toString() : '0',
      blueCollarCV: applicant.isBlueCollarCat,
      frmjobseeker: isCorporate ? '0' : '1',
    }));

    return `https://gateway.bdjobs.com/cvdetails/details-view?Idn=${applicant.applicantId
      }&key=&keytype=&purchasedCV=${applicant.isPurchased
      }&blueCollarCV=${applicant.isBlueCollarCat
      }&frmjobseeker=${isCorporate ? '0' : '1'
      }&IsInWishList=${applicant.isInWishList
      }&sl=1&info=${encrypted}`;
  }
}