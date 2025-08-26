export interface Mobile {
  mobileNoType: number;
  mobileNo: string;
}

export interface Email {
  emailType: number;
  emailAddress: string;
}

export interface LocationItem {
  countryId?: number;
  countryName?: string;
  districtId?: number;
  districtName?: string;
  thanaId?: number;
  thanaName?: string;
  postOfficeId?: number;
  postOfficeName?: string;
}

export interface Address {
  addressType: number;
  country: LocationItem;
  district: LocationItem;
  thana: LocationItem;
  postOffice: LocationItem;
  isOutsideInBangaldesh: boolean;
  location: string;
  fullAddress: string;
}

export interface CvBankApplicantResponse {
  error: string;
  message: string;
  sql: string;
  wishList: string;
  pagination: string;
  pageNo: string;
  access: string;
  cvCount: number;
  starCVCount: number;
  cvBankDetails: Applicant[];
  totalRecordFound: number;
  totalPage: number;
  totalStarPage: number;
  session: boolean;
  saveFilterName: string;
  saveFilterValue: string;
  reqCount: number;
}

export interface Applicant {
  testID: number;
  recordNo: number;
  href: string;
  photo: string;
  gender: string | null;
  certificationBadge: string;
  applicantId: string;
  applicantBlurName: string;
  applicantName: string;
  applicantNameHighlighted: string;
  resumeViewedAlready: boolean;
  noAccessButBlueCollar: string;
  age: string;
  university: string;
  degree: string;
  starRating: string;
  experienceFrom: string;
  experience: string;
  expectedSalary: string;
  removeFromShortList: string;
  shortList: number;
  skillCount: string;
  workAreaCount: string;
  isInWishList: number;
  isPurchased: number;
  isBlueCollarCat: number;
  blueCollarWatchList: string;
  tillDate: string;
  inListId: string;
  inListName: string;
  videoResumeLink: string;
  getAccessForResume: string;
  attachedCV: number;
  videoResume: boolean;
  resumeType: number;
  EncrpID: string;
  openToWork: number;
  rankPoint: number;
  mobiles: (Mobile | null)[];
  emails: Email[];
  address: Address[];
  expiredDate: string;
}

export interface Video {
  sourceURL: string;
  name: string;
  videoQID: number;
  answerOn: string;
  qText: string;
}

export interface VideoResponse {
  ratedBy: number;
  totalRating: number
  thisUserRating: number;
  videos: Video[];
}

export interface SkillExperienceResponse {
  Error: string;
  Message: string;
  DataSkillWorkArea: SkillWorkArea[];
}

export interface SkillWorkArea {
  SkillName: string;
  SkillType: string;
  totalExp: number;
  ExperienceDuration: string;
  SkilledBy: string;
  SkillLevel: string;
}


export interface PurchaseList {
  id: string;
  cpId: string;
  purchaseListId: number;
  purchaseListName: string;
  purchaseListDescription: string;
  purchaseCVs: PurchaseCV[];
  userId?: string;
}

export interface PurchaseCV {
  EncCandId: string;
  candidateId: number;
  purchaseDate: "0001-01-01T00:00:00.000+00:00";
  expiryDate: "0001-01-01T00:00:00.000+00:00";
}



export interface GetPurchaseListResponse {
  id: string;
  responseType: string;
  dataContext: any;
  message: string | null;
  responseCode: number;
  requestedData: any;
  data: PurchaseListItem[] | null;
}

export interface PurchaseListItem {
  id: string;
  companyId: string;
  listId: number;
  listName: string;
  listDescription: string;
  purchased: number;
  wishlist: number;
  createdOn: string; // ISO date string
}