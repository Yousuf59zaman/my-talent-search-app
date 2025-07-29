import { isDevMode } from '@angular/core';
import { TabItem } from '../../features/tabs/tabs.component';

export enum Cookies {
  AUTH = 'AUTHTOKEN',
  REFTOKEN = 'REFTOKEN',
  MybdjobsUserId = 'MybdjobsUserId',
}

 export const RecruiterPanelUrl = 'https://recruiter.bdjobs.com/';
 export const MybdjobsPanelUrl = 'https://mybdjobs.bdjobs.com/';
 export const RecruiterDashboard = 'https://recruiter.bdjobs.com/dashboard';
 export const BdjobsUrl = 'https://www.bdjobs.com/';


export enum ResponseType {
  Success = 'Success',
  Error = 'Error',
  True = 1,
  False = 0,
}

export enum ResponseCode {
  success = 1,
  Error = 0,
}



export enum PageType {
  All = 'al',
}



export enum SType {
  All = 'al',
}

export enum LastUserTypes {
  Corporate = '1',
  Jobseeker = '2',
  None = '0',
}


export const LastUserType = 'LastUserType';
export const CompanyIdLocalStorage = 'CompanyId';
export const JobNoLocalStorage = 'jobno';
export const UserId = 'UserId';
export const CompanyName = 'CompanyName';
export const CompanyLogoUrl = 'CompanyLogoUrl';
export const IsAdminUser = 'IsAdminUser';
export const IsCorporateUser = 'IsCorporateUser';
export const Domain = isDevMode() ? 'test' : 'gateway';

export type UserType = 'Corporate' | 'Jobseeker'| null;
export const RecruiterUser = 'Corporate';
export const JobseekerUser = 'Jobseeker';
export interface SupportingInfo {
  EmployeeMaxSize: number;
  EmployeeId: number;
  VideoCvContent: number;
  BannerShow: number;
  GoToNewJobPostings: boolean;
  GoToNewJobPostingsNewCompany: boolean;
  EntrepreneurCompany: boolean;
  EntrepreneurJobMail: boolean;
  RecruiterNewView: boolean;
  EmployerAppPromotion: boolean;
  EmployerApplicantProcessPromotion: boolean;
  ContactPerson: string;
  Name: string;
  Email: string;
  BillingContact: string;
  CompanyCountry: string;
  CreatedDate: string;
  UserName: string;
  Nd: boolean;
  ClosingLoopAccess: boolean;
  CompanyCity: string;
  AdminUserType: boolean;
  VerificationStatus: boolean;
  Feedback: boolean;
  NidVerify: boolean;
  SalesPersonName: string;
  SalesPersonDesignation: string;
  SalesPersonContact: string;
  SalesPersonEmail: string;
  SalesPersonImage: string;
  CvSearchAccess: boolean;
  JobPostingAccess: boolean;
  RemainingDaysCv: number | null;
  RemainingDaysJob: number | null;
  RemainingCv: string | null;
  JobPostingLimit: string | null;
  CvSearchService: {
    StartingDate: string | null;
    EndingDate: string | null;
    Id: number | null;
    Limit: number | null;
    Available: number | null;
    Viewed: number | null;
  };
  SmsPurchased: number;
  SmsSend: number;
  SmsRemaining: number;
  InvitedJobAccess: boolean;
  CompanyLiveJob: boolean;
  PaymentProcess: boolean;
  CompanySurvey: boolean;
  CompanySurveyID: string;
  CorporateAssessment: boolean;
  AssessmentPopupDisplay: boolean;
  Assessment2ndDisplay: string;
  CustomizeUrl: boolean;
  SmsPackage: boolean;
  OnlineTestService: boolean;
  UserAccessManagement: boolean;
  CorporateEmailService: boolean;
  AccessHighPrioritySignal: boolean;
  ApiAccessCvExport: boolean;
  CompanyActiveLogoURL: string;
  LastPostingDate: string;
  TotalPostedJob: number;
  TotalDraftedJob: number;
  TotalArchiveJob: number;
  TotalJobfairJob: number;
  TotalJobForUser: number;
  JobPostingService: {
    StartingDate: string | null;
    EndingDate: string | null;
    BasicListLimit: number | null;
    Id: number | null;
    MaxJob: number | null;
    MaxStandout: number | null;
    StandoutLimit: number | null;
    StandoutPremiumLimit: number | null;
    MaxStandoutPremium: number | null;
    BasicWhiteCollarLimit: number | null;
    StandOutCollarLimit: number | null;
    StandOutPremiumCollarLimit: number | null;
    BasicBlueCollarLimit: number | null;
    StandOutBlueCollarLimit: number | null;
    StandOutPremiumBlueCollarLimit: number | null;
    BasicBlueCollarPosted: number | null;
    StandOutBlueCollarPosted: number | null;
    StandOutPremiumBlueCollarPosted: number | null;
    JobPostingAccessForWhiteColler: number | null;
  };
}
export interface MybdjobsUserApiResponse<T>{
  eventType: number;
  eventData:EventData<T>[]
  eventId:number
}
export interface EventData<T> {
  key: string;
  value: T
}
export interface CreateCompanyId {
    companyId:string;
    userId:string;
    companyName:string;
    photoUrl:string
}
export interface CorporateSession {
  message: string;
  token: string;
  refreshToken: string;
  encryptId: string;
}

export enum MybdjobsUserApiResponseType{
  SuccessResponse = 1,
  ErrorResponse = 2,
}

export interface BdjAnalyticsApiResponse{
  eventType: number
  eventData: eventData[]
  eventId: number
}

interface eventData {
  key: string;
  value: string
}
export const corporateUserTabs: TabItem[] = [
  { id: 'cv-search', label: 'Talent Search' },
  { id: 'saved-filters', label: 'Saved Filters' },
  { id: 'shortlisted-cvs', label: 'Shortlisted CVs' },
  { id: 'purchase-list', label: 'Purchase List' },
];
export const jobSeekUserTabs: TabItem[] = [
  { id: 'cv-search', label: 'Expert Search' },
  { id: 'saved-filters', label: 'Saved Filters' },
  { id: 'purchase-list', label: 'My Expert' },
];