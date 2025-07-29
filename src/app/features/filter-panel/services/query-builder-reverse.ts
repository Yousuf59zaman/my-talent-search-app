import { FilterForm } from '../models/form.models';
import { SelectItem } from '../../../shared/models/models';
import { MaxAgeRange, MaxExpRange, MaxSalaryRange } from '../../search-talent/search-talent/search-talent.component';
import { FilterDataService } from './filter-data.service';
import { firstValueFrom } from 'rxjs';

export class QueryBuilderReverse {

  static async toFilterForm(query: any, filterService: FilterDataService): Promise<FilterForm> {
    const parseRange = (val: string, def: number[]): number[] => {
      if (!val || val === '/' || val === undefined) return def;
      const arr = decodeURIComponent(val).split('/').map(Number);
      return arr.length === 2 && arr.every(n => !isNaN(n)) ? arr : def;
    };
    const parseBool = (val: any) => val === '1' || val === true || val && parseInt(val) > 0;
    const parseSelectItems = (val: string, key = 'value'): SelectItem[] | null => {
      if (!val) return null;
      return val.split(',').filter(Boolean).map((v, i) => ({ label: v, value: v, selectId: `${v}_${i}` }));
    };
    const parseSelectItemsByLabel = (val: string, seperator = ','): SelectItem[] | null => {
      if (!val) return null;
      return val.split(seperator).filter(Boolean).map((label, i) => ({ label, value: label, selectId: `${label}_${i}` }));
    };

    const handleLocation = async (loc: string): Promise<SelectItem[] | null> => {
      if (!loc) return null;
      const locIds = loc.split(',').filter(Boolean);
      const idsWithD_underscore = locIds.length > 1 ? locIds.join('__') : locIds[0];
      const response = await firstValueFrom(filterService.getLocationsById({ LocationId: idsWithD_underscore }));
      if (!response?.data) return null;
      const items = response.data
        .map((item: any, i: number) => ({
          label: item.locName,
          value: item.locId,
          selectId: `${item.locId}_${i}`
        }));
      return items.length ? items : null;
    };

    const parseSkills =  async (val: string): Promise<SelectItem[] | null> => {
      if (!val) return null;
      const skillIds = val.split(',').filter(Boolean);
      const response = await firstValueFrom(
        filterService.getSkillsByIds({ searchTxt: skillIds.join('__') })
      );
      return response?.data
        ?.map((skill: any, i: number) => {
          if (skillIds.includes(skill.id.toString())) {
            return {
              label: skill.value,
              value: skill.id,
              selectId: `${skill.id}_${i}`
            } as SelectItem;
          }
          return null;
        })
        .filter((item): item is SelectItem => item !== null) || null;
    }

    const parseKeywordCategory = (value: string, type: string) : boolean => {
      if (!value) return false;
      const categories = value.split(',').map(cat => cat.trim());
      switch (type) {
        case 'skills':
          if (categories.includes('4')) return true;
          break;
        case 'education':
          if (categories.includes('2')) return true;
          break;
        case 'experience':
          if (categories.includes('3')) return true;
          break;
      }
      return false;
    }

    const parseExpertise =  async (val: string): Promise<SelectItem[] | null> => {
      if (!val) return null;
      const expertiseIds = val.split(',').filter(Boolean);
      const skillIds = expertiseIds.map(id => id.split('_')[0]);
      const noOfYears = expertiseIds.map(id => id.split('_')[1] ? Number(id.split('_')[1]) / 12 : 0);
      const response = await firstValueFrom(
        filterService.getSkillsByIds({ searchTxt: skillIds.join('__') })
      );
      return response?.data
        ?.map((skill: any, i: number) => {
          if (skillIds.includes(skill.id.toString())) {
            return {
              label: skill.value,
              value: skill.id,
              selectId: `${skill.id}_${i}`,
              extraParam: noOfYears[i] || 0
            } as SelectItem;
          }
          return null;
        })
        .filter((item): item is SelectItem => item !== null) || null;
    }
    const resolveAgeValue = (
      query: { qAge?: string; AgeMin?: string; AgeMax?: string }
    ): string | undefined => {
      if (query.qAge) return query.qAge;

      const min = Number(query.AgeMin);
      const max = Number(query.AgeMax);

      if (!isNaN(min) && !isNaN(max)) return `${min}/${max}`;
      if (!isNaN(min)) return `${MaxAgeRange[0]}/${min}`;
      if (!isNaN(max)) return `${max}/${MaxAgeRange[1]}`;

      return undefined;
    };
    const resolveExpValue = (
      query: { qExp?: string; ExpTo?: string; ExpFrom?: string }
    ): string | undefined => {
      if (query.qExp) return query.qExp;

      const min = Number(query.ExpFrom);
      const max = Number(query.ExpTo);

      if (!isNaN(min) && !isNaN(max)) return `${min}/${max}`;
      if (!isNaN(min)) return `${MaxExpRange[0]}/${min}`;
      if (!isNaN(max)) return `${max}/${MaxExpRange[1]}`;

      return undefined;
    };
    const resolveCurrentLocationValue = (
      query: { qCurLoc?: string; CurrentLocation?: string }
    ): string => {
      if (query.qCurLoc) return query.qCurLoc;
      if (query.CurrentLocation) return query.CurrentLocation.replace(/\|/g, ',');
      return '';
    };

    return {
      keyword: query.qKeyword || null,
      expectedSalary: parseRange(query.qSalary, MaxSalaryRange),
      ageRange: parseRange(resolveAgeValue(query) ?? '', MaxAgeRange),
      experience: parseRange(resolveExpValue(query) ?? '', MaxExpRange),
      category: query.CatId && query.CatId !== '-1' && query.CatName !== 'Select' ? [{ label: decodeURIComponent(query.CatName) || '', value: query.CatId, selectId: `${query.CatId}_0` }] : null,
      gender: query.qSex ? (query.qSex === 'M' ? 'Male' : query.qSex === 'F' ? 'Female' : 'Other') : null,
      isEntry: (query.qPref || '').includes('Entry'),
      isMid: (query.qPref || '').includes('Mid'),
      isTop: (query.qPref || '').includes('Top'),
      immediateAvailable: parseBool(query.immediateAvailable),
      showStarCandidates: !!query.isStarCandidate,
      personsWithDisabilities: parseBool(query.qPWD),
      location: query.qJobLoc || query.Job_Loc ? await handleLocation(query.qJobLoc || query.Job_Loc) : parseSelectItems(query.qJobLoc || query.Job_Loc),
      education: query.qEduLevel ? Number(query.qEduLevel) : null,
      skills: await parseSkills(query.qOrgType),
      industries: parseSelectItemsByLabel(query.qBusiness),
      courses: parseSelectItemsByLabel(query.qDegree),
      institutes: parseSelectItemsByLabel(query.InsName, '__'),
      isExperience: parseKeywordCategory(query.qkeywordfiltertype, 'experience'),
      isSkills: parseKeywordCategory(query.qkeywordfiltertype, 'skills'),
      isEducation: parseKeywordCategory(query.qkeywordfiltertype, 'education'),
      isCurrentLocation: parseBool(resolveCurrentLocationValue(query)),
      isPermanentLocation: parseBool(query.qPerLoc),
      isPreferredLocation: parseBool(query.qJobLocName),
      expertise: await parseExpertise(query.qWorkArea),
      isRetiredArmy: parseBool(query.qArmyPerson),
      isHighestDegree: parseBool(query.qHighestDegree),
      industryType: null,
      currentSalary: parseRange(query.currentSalary, []),
      videoCV: parseBool(query.videoCV),
      shortlist: null,
      lastUpdated: query.qLastUpdated || null,
      purchaseListId: query.WishListId || null,
      isAlreadyPurchased: parseBool(query.AlreadyPurchased),
      examTitle: query.qEduTitle || null
    };
  }
}
