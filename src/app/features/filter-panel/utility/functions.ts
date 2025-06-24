import { SelectItem } from "../../../shared/models/models";
import { FilterBadge } from "../../active-filters/active-filters/active-filters.component";
import { MaxAgeRange, MaxExpRange, MaxSalaryRange } from "../../search-talent/search-talent/search-talent.component";
import { DegreeLevel } from "../models/filter-datamodel";
import { FilterForm } from "../models/form.models";

export function generateFilterBadges(filters: FilterForm | null): FilterBadge[] {
  if (!filters) return [];

  const badges: FilterBadge[] = [];

  const addBadge = (id: string, label: string, type: string, value: any) => {
    badges.push({ id, label, type, value });
  };

  const handleRange = (
    id: string,
    labelPrefix: string,
    range: number[] | undefined,
    defaultRange: number[]
  ) => {
    if (range && !isDefaultRange(range, defaultRange)) {
      addBadge(id, `${labelPrefix}: ${range[0]} - ${range[1]}`, id, range);
    }
  };

  const handleArray = (
    idPrefix: string,
    labelPrefix: string,
    items: SelectItem[] | null,
    joinWithComma: boolean = false
  ) => {
    if (!items || items.length === 0) return;

    if (joinWithComma) {
      const labels = items
        .map((item) => `${item.label}${item.extraParam ? ' (' + item.extraParam + 'years)' : ''}`)
        .join(', ');
      addBadge(`${idPrefix}`, `${labelPrefix}: ${labels}`, idPrefix, items);
    } else {
      items.forEach((item) => {
        addBadge(
          `${idPrefix}`,
          `${labelPrefix}: ${item.label} ${item.extraParam ? ' (' + item.extraParam + 'years)' : ''}`,
          idPrefix,
          item
        );
      });
    }
  };

  const handleBoolean = (id: string, label: string, value: boolean | undefined) => {
    if (value) {
      addBadge(id, label, id, true);
    }
  };

  if (filters.shortlist) {
    addBadge("shortlist", `Shortlist: ${filters.shortlist.name}`, "shortlist", filters.shortlist.name)
  }

  if (filters.keyword) {
    const searchTypes = [
      filters.isEducation && "Education",
      filters.isSkills && "Skills",
      filters.isExperience && "Experience",
    ]
      .filter(Boolean)
      .join(", ");
    const searchTypesText = searchTypes ? ` (${searchTypes})` : "";
    addBadge("keyword", `Keyword: ${filters.keyword}${searchTypesText}`, "keyword", filters.keyword);
  }

  handleRange("ageRange", "Age", filters.ageRange, MaxAgeRange);
  handleRange("experience", "Experience", filters.experience, MaxExpRange);
  handleRange("expectedSalary", "Expected Salary", filters.expectedSalary, MaxSalaryRange);
  // handleRange("currentSalary", "Current Salary", filters.expectedSalary, [10000, 200000]);

  if (filters.gender) {
    addBadge("gender", filters.gender, "gender", filters.gender);
  }

  if (filters.location?.length) {
    const locationTypes = [
      filters.isCurrentLocation && "Current",
      filters.isPermanentLocation && "Permanent",
      filters.isPreferredLocation && "Preferred",
    ]
      .filter(Boolean)
      .join(", ");
    const locationTypeText = locationTypes ? ` (${locationTypes})` : "";
    filters.location.forEach((loc) => {
      addBadge(`location`, `Location: ${loc.label}${locationTypeText}`, "location", loc);
    });
  }

  if (filters.education) {
    const highestText = filters.isHighestDegree ? " (Highest)" : "";
    const edu = DegreeLevel.find((edu) => edu.value === filters.education);
    addBadge(`education`, `Education: ${edu?.label}${highestText}`, "education", edu);
  }

  if (filters.lastUpdated) {
    addBadge("lastUpdated", `Last Updated Within: ${getMonthsOrYears(filters.lastUpdated)}`, "lastUpdated", filters.lastUpdated);
  }

  handleArray("courses", "Course", filters.courses);
  handleArray("institutes", "Institute", filters.institutes, true);
  handleArray("skills", "Skill", filters.skills, true);
  handleArray("industries", "Industry", filters.industries, true);
  handleArray("industryType", "Industry Type", filters.industryType);
  handleArray("category", "Category", filters.category);
  handleArray("expertise", "Expertise", filters.expertise);

  handleBoolean("isEntry", "Entry Level", filters.isEntry);
  handleBoolean("isMid", "Mid Level", filters.isMid);
  handleBoolean("isTop", "Top Level", filters.isTop);

  handleBoolean("immediateAvailable", "Immediate Available", filters.immediateAvailable);
  handleBoolean("showStarCandidates", "Star Candidates", filters.showStarCandidates);
  handleBoolean("personsWithDisabilities", "Persons with Disabilities", filters.personsWithDisabilities);
  handleBoolean("isRetiredArmy", "Retired Army Person", filters.isRetiredArmy);

  return badges;
}

export function isDefaultRange(range: number[], defaultRange: number[]): boolean {
  return range?.[0] === defaultRange[0] && range?.[1] === defaultRange[1];
}

function getMonthsOrYears(noOfDays: string) {
  if (!noOfDays) return "";
  switch (noOfDays) {
    case '30':
      return '1 Month';
    case '60':
      return '2 Months';
    case '90':
      return '3 Months';
    case '180':
      return '6 Months';
    case '365':
      return '1 Year';
    case '730':
      return '2 Years';
    default:
      return '';
  }
}
