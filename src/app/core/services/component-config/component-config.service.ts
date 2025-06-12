import { inject, Injectable } from '@angular/core';
import {
  ResolveFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AppCardConfig, ComponentConfig, FilterConfig, JobInfoConfig, TabsConfig } from '../../../shared/models/configs';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../../../shared/models/response';
import { ResponseCode, ResponseType } from '../../../shared/enums/app.enums';
import { SkillExperienceResponse } from '../../../features/applicant/models/applicant.model';

@Injectable({
  providedIn: 'root',
})
export class ComponentConfigService {
  constructor() {}

  getPageConfig(slug: string): Observable<ApiResponse<ComponentConfig<JobInfoConfig | FilterConfig | TabsConfig | AppCardConfig>[]>> {
    let data: ComponentConfig<JobInfoConfig | FilterConfig | TabsConfig | AppCardConfig>[] = [];
    switch (slug) {
      case 'applicants':
        data = applicantPageConfig;
        break;
      case 'analytics':
        data = analyticsPageConfig;
        break;
      default:
        data = applicantPageConfig;
        break;
    }

    const mock: ApiResponse<ComponentConfig<JobInfoConfig | FilterConfig | TabsConfig | AppCardConfig>[]> = {
      responseType: ResponseType.Success,
      dataContext: null,
      responseCode: ResponseCode.success,
      requestedData: null,
      data: data,
    };

    return of<ApiResponse<ComponentConfig<JobInfoConfig | FilterConfig | TabsConfig>[]>>(mock);
  }
}

export const ComponentConfigResolver: ResolveFn<
  ApiResponse<ComponentConfig<JobInfoConfig | FilterConfig | TabsConfig | AppCardConfig>[]>
> = (route: ActivatedRouteSnapshot) => {
  return inject(ComponentConfigService).getPageConfig(route.url[0].path);
};

const applicantPageConfig: ComponentConfig<JobInfoConfig | FilterConfig | TabsConfig | AppCardConfig>[] = [
  {
    id: 10,
    name: 'left-filter-panel',
    data: {
      requirementMatching: {
        isActive: true,
        type: 'btn-group',
        extras: [100, 75, 50, 40, 25]
      },
      matchingCriteria: {
        isActive: true
      },
      quickFilters: {
        isActive: true,
        type: 'accordion-group',
        extras: {
          isOpen: true
        }
      },
      salaryRange: {
        isActive: true,
      },
      ageRange: {
        isActive: true
      },
      expRange: {
        isActive: true
      },
      areaOfExp: {
        isActive: true,
        type: 'accordion-group',
        extras: {
          isOpen: false
        }
      },
      industry: {
        isActive: true,
        type: 'multi-select',
        extras: {
          isSearch: true,
          maxSelection: 5,
          alwaysOnOption: true
        }
      },
      skills: {
        isActive: true,
        type: 'multi-select',
        extras: {
          isSearch: true,
          maxSelection: 5,
          alwaysOnOption: true
        }
      },
      academic: {
        isActive: true,
        type: 'accordion-group',
        extras: {
          isOpen: false
        }
      },
      institutes: {
        isActive: true,
        type: 'multi-select',
        extras: {
          isSearch: true,
          maxSelection: 5,
          alwaysOnOption: false
        }
      },
      degreeLevel: {
        isActive: true
      },
      courseName: {
        isActive: true,
        type: 'search-with-button',
        extras: {
          isSearchIcon: true,
          searchLabel: ''
        }
      },
      result: {
        isActive: true
      },
      majorSubject: {
        isActive: true
      },
      location: {
        isActive: true,
        type: 'accordion-group',
        extras: {
          isOpen: false
        }
      },
      locationSearch: {
        isActive: true,
      },
      present: {
        isActive: true,
      },
      permanent: {
        isActive: true,
      },
      keyWords: {
        isActive: true,
        type: 'accordion-group',
        extras: {
          isOpen: false
        }
      },
      keyWordSearch: {
        isActive: true,
        type: 'search-with-button',
        extras: {
          isSearchIcon: true,
          searchLabel: ''
        }
      },
      others: {
        isActive: true,
        type: 'accordion-group',
        extras: {
          isOpen: false
        }
      },
      searchApplicant: {
        isActive: true,
        type: 'search-with-button',
        extras: {
          isSearchIcon: false,
          searchLabel: 'Find'
        }
      },
      gender: {
        isActive: true
      },
      jobLevel: {
        isActive: true
      },
      videoCv: {
        isActive: true
      }
    }
  },
  {
    id: 11,
    name: 'job-title',
    data: {
      isTitle: true,
      isStatus: true,
      isEdit: true,
      isRepost: true,
      isShare: true,
      isShareOption: true,
      isJobDuration: true,
      isPreview: true,
      isAnalytics: true,
      isMessage: true,
      isUserGuide: true,
    }
  },
  {
    id: 12,
    name: 'tabs',
    data: {
      isActivityList: true,
      isAllApplicantsTabs: true,
      isAllViewedTabs: true,
      isSorting: true,
      isTopPagination: true,
      isBottomPagination: true,
      isDownloadAppList: true,
      isSelection: true,
      isStepper: true,
    }
  },
  {
    id: 13,
    name: 'applicant-card',
    data: {
      isTitle: true,
      isStatus: true,
      isEdit: true,
      isRepost: true,
      isShare: true,
      isShareOption: true,
      isJobDuration: true,
      isPreview: true,
      isAnalytics: true,
      isMessage: true,
      isUserGuide: true,
    }
  },
];

const analyticsPageConfig: ComponentConfig<any>[] = [
  {
    id: 1,
    name: 'overview',
    data: {}
  },
  {
    id: 2,
    name: 'bar-charts',
    data: {}
  },
  {
    id: 3,
    name: 'pie-charts',
    data: {}
  },
];




export const mockSkillExperienceResponse: SkillExperienceResponse = {
  Error: "0",
  Message: "Success",
  DataSkillWorkArea:  [
    {
        "SkillName": "ABAP",
        "SkillType": "skill",
        "totalExp": 0,
        "ExperienceDuration": "",
        "SkilledBy": "Job experience,Professional training,NTVQF,Academic,Self-taught",
        "SkillLevel": ""
    },
    {
        "SkillName": "Engineering",
        "SkillType": "skill",
        "totalExp": 0,
        "ExperienceDuration": "",
        "SkilledBy": "Job experience,Professional training,NTVQF,Academic,Self-taught",
        "SkillLevel": ""
    },
    {
        "SkillName": "HTML/ DHTML",
        "SkillType": "skill",
        "totalExp": 0,
        "ExperienceDuration": "",
        "SkilledBy": "Self-taught",
        "SkillLevel": ""
    },
    {
        "SkillName": "html 5",
        "SkillType": "workarea",
        "totalExp": 0,
        "ExperienceDuration": "",
        "SkilledBy": "",
        "SkillLevel": ""
    },
    {
        "SkillName": "HTML CSS",
        "SkillType": "workarea",
        "totalExp": 72,
        "ExperienceDuration": "6 Years",
        "SkilledBy": "",
        "SkillLevel": ""
    },
    {
        "SkillName": "HTML5 and CSS3",
        "SkillType": "workarea",
        "totalExp": 0,
        "ExperienceDuration": "6 Years",
        "SkilledBy": "",
        "SkillLevel": ""
    },
    {
        "SkillName": "Test Driven Development (TDD)",
        "SkillType": "workarea",
        "totalExp": 0,
        "ExperienceDuration": "6 Years",
        "SkilledBy": "",
        "SkillLevel": ""
    },
    {
        "SkillName": "Wahsing Quality",
        "SkillType": "workarea",
        "totalExp": 0,
        "ExperienceDuration": "6 Years",
        "SkilledBy": "",
        "SkillLevel": ""
    }
  ]
};

