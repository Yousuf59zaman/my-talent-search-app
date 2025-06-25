import { filter } from 'rxjs';
import { SelectItem } from '../../../shared/models/models';
import { MaxAgeRange, MaxExpRange, MaxSalaryRange } from '../../search-talent/search-talent/search-talent.component';
import { FilterForm } from '../models/form.models';

export class QueryBuilder {
  CompanyId: string;
  CatId = '';
  CatName = '';
  qSex = '';
  qJobLoc = '';
  qJobLocName = '';
  qAge = '/';
  qPref = '';
  qstar = '';
  qEduLevel = '';
  qHighestDegree = '';
  qDegree = '';
  qResult = '';
  qGrade = '/';
  InsType = '';
  qExp = '/';
  qBusiness = '';
  qLastUpdated = '';
  qOrgType = '';
  qWorkArea = '';
  qvalSearchType = '1';
  qSortby = '';
  qSortType = '';
  qpgcl = '';
  qPgNo = '';
  qTPgNo = '';
  qKeyword = '';
  qKeywordType = '';
  qFilter = '0';
  qFilterName = '';
  qwatchlist = '';
  qCurLoc = '';
  qPerLoc = '';
  qArmyPerson = '';
  qkeywordfiltertype = '';
  foreigninstitute = '';
  ApplicantName = '';
  qSalary = '';
  InsName = '';
  qPWD = '';
  qEduTitle = '';
  reqCount = '0';
  immediateAvailable = '';
  isStarCandidate = false;
  WishListId = '';
  AlreadyPurchased= '0';

  constructor(filterData: FilterForm, compamyId: string, pageNo: number = 1) {
    this.CompanyId = compamyId || '';
    this.qPgNo = pageNo.toString();
    this.CatId =
      filterData.category && filterData.category.length
        ? filterData.category[0].value
        : '';
    this.qSex = filterData.gender
      ? this.getGenderQueryVal(filterData.gender)
      : '';
    this.qJobLoc =
      filterData.location && filterData.location.length
        ? filterData.location.map((loc) => loc.value).join(',')
        : '';
    this.qJobLocName =
      this.qJobLoc && filterData.isPreferredLocation ? this.qJobLoc : '';
    this.qAge = this.getRangeQuery(filterData.ageRange, MaxAgeRange);
    this.qPref = this.getJobLevelQuery(filterData);
    this.isStarCandidate = !!filterData.showStarCandidates;
    this.qEduLevel =
      filterData.education && filterData.education
        ? filterData.education.toString()
        : '';
    this.qHighestDegree = filterData.isHighestDegree ? '1' : '0';
    this.qDegree =
      filterData.courses && filterData.courses.length
        ? filterData.courses.map((c) => c.label).join(',')
        : '';
    this.qWorkArea = this.getExpertise(filterData);
    this.qExp = this.getRangeQuery(filterData.experience, MaxExpRange);
    this.qBusiness = this.getBusinessQuery(filterData);
    this.qOrgType =
      filterData.skills && filterData.skills.length
        ? filterData.skills.map((edu) => edu.value).join(',')
        : '';
    this.qKeyword = filterData.keyword ? filterData.keyword : '';
    this.qkeywordfiltertype = this.getKeyWordFilterType(filterData);
    this.qCurLoc =
      this.qJobLoc && filterData.isCurrentLocation ? this.qJobLoc : '';
    this.qPerLoc =
      this.qJobLoc && filterData.isPermanentLocation ? this.qJobLoc : '';
    this.qArmyPerson = filterData.isRetiredArmy ? '1' : '0';
    this.qSalary = this.getRangeQuery(filterData.expectedSalary, MaxSalaryRange);
    this.InsName =
      filterData.institutes && filterData.institutes.length
        ? filterData.institutes.map((edu) => edu.label).join(',')
        : '';
    this.qPWD = filterData.personsWithDisabilities ? '1' : '0';
    this.immediateAvailable = filterData.immediateAvailable ? '1' : '0';
    this.qwatchlist = filterData.shortlist ? filterData.shortlist.id : '';
    this.qLastUpdated = filterData.lastUpdated ? filterData.lastUpdated : '';
    this.WishListId = filterData.purchaseListId || '';
    this.AlreadyPurchased = filterData.isAlreadyPurchased ? '1' : '0';
  }

  private getRangeQuery(experience: number[], maxRange: number[]): string {
    if (!experience || (experience && experience.length === 0)) {
      return '/';
    }
    return experience.length === 2 &&
    experience[0] === maxRange[0] &&
    experience[1] === maxRange[1]
      ? '/'
      : experience.length
        ? experience.join('/')
        : '/';
  }

  private getBusinessQuery(filterData: FilterForm) {
    let queryString = '';
    if (filterData.industries && filterData.industries.length) {
      queryString = filterData.industries.map((edu) => edu.label).join(',');
    }
    if (filterData.industryType && filterData.industryType.length) {
      if (
        !queryString.includes(filterData.industryType[0].value) &&
        queryString !== ''
      ) {
        queryString += `,${filterData.industryType[0].value}`;
      } else if (queryString === '') {
        queryString = filterData.industryType[0].value;
      }
    }

    return queryString;
  }

  private getExpertise(filterData: FilterForm): string {
    if (filterData.expertise && filterData.expertise.length) {
      return filterData.expertise
        .map(
          (ex: SelectItem) => `${ex.value}_${ex.extraParam ? ex.extraParam*12 : 0}`
        )
        .join(',');
    }
    return '';
  }

  private getKeyWordFilterType(filterData: FilterForm): string {
    if (this.qKeyword) {
      const jobLevels = [
        { key: 'education', value: filterData.isEducation ? 2 : 0 },
        { key: 'skills', value: filterData.isSkills ? 4 : 0 },
        { key: 'exp', value: filterData.isExperience ? 3 : 0 },
      ];
      const levels = jobLevels.filter((level) => level.value > 0);
      return levels.length ? levels.map((level) => level.value).join(',') : '';
    }

    return '';
  }

  private getJobLevelQuery(filterData: FilterForm): string {
    const jobLevels = [
      { key: 'Entry', value: filterData.isEntry },
      { key: 'Mid', value: filterData.isMid },
      { key: 'Top', value: filterData.isTop },
    ];
    const levels = jobLevels.filter((level) => level.value);
    return levels.length ? levels.map((level) => level.key).join(',') : '';
  }

  private getGenderQueryVal(gender: string) {
    switch (gender) {
      case 'Male':
        return 'M';
      case 'Female':
        return 'F';
      case 'Other':
        return 'O';
      default:
        return '';
    }
  }
}
