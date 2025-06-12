export interface ComponentConfig<T> {
  id: number;
  name: string;
  data: T
}

export interface JobInfoConfig {
  isTitle: boolean;
  isStatus: boolean;
  isEdit: boolean;
  isRepost: boolean;
  isShare: boolean;
  isShareOption: boolean;
  isJobDuration: boolean;
  isPreview: boolean;
  isAnalytics: boolean;
  isMessage: boolean;
  isUserGuide: boolean;
}

export interface FilterConfig {
  requirementMatching: UiConfig;
  matchingCriteria: UiConfig;
  quickFilters: UiConfig;
  salaryRange: UiConfig;
  ageRange: UiConfig;
  expRange: UiConfig;
  areaOfExp: UiConfig;
  industry: UiConfig;
  skills: UiConfig;
  academic: UiConfig;
  institutes: UiConfig;
  degreeLevel: UiConfig;
  courseName: UiConfig;
  result: UiConfig;
  majorSubject: UiConfig;
  location: UiConfig;
  locationSearch: UiConfig;
  present: UiConfig;
  permanent: UiConfig;
  keyWords: UiConfig;
  keyWordSearch: UiConfig;
  others: UiConfig;
  searchApplicant: UiConfig;
  gender: UiConfig;
  jobLevel: UiConfig;
  videoCv: UiConfig;
}

export interface TabsConfig {
  isActivityList: boolean;
  isAllApplicantsTabs: boolean;
  isAllViewedTabs: boolean;
  isSorting: boolean;
  isTopPagination: boolean;
  isBottomPagination: boolean;
  isDownloadAppList: boolean;
  isSelection: boolean;
  isStepper: boolean;
}

export interface AppCardConfig {
  isActivityList: boolean;
  isAllApplicantsTabs: boolean;
  isAllViewedTabs: boolean;
  isSorting: boolean;
  isTopPagination: boolean;
  isBottomPagination: boolean;
  isDownloadAppList: boolean;
  isSelection: boolean;
  isStepper: boolean;
}

export interface UiConfig {
  isActive: boolean;
  type?: string;
  extras?: any;
}
