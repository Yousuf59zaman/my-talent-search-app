
import { Applicant } from "../models/applicant.model";
import { LocalstorageService } from "../../../core/services/essentials/localstorage.service";
import { IsCorporateUser } from "../../../shared/enums/app.enums";

export abstract class ApplicantCard {

  public static getCVDetailsLink(
    applicant: Applicant | null, isCorporate: boolean 
  ): string {
  
    if (!applicant) return '';
   
    return `https://recruiter.bdjobs.com/cvdetails/details-view?Idn=${applicant.applicantId
      }&key=&keytype=&purchasedCV=${applicant.isPurchased
      }&blueCollarCV=${applicant.isBlueCollarCat
      }&frmjobseeker=${isCorporate ? '0' : '1'
      }&IsInWishList=${applicant.isInWishList
      }&sl=1`;
  }
}