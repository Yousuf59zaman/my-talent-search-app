import { SelectItem } from "../../../shared/models/models";
import { FilterBadge } from "../../active-filters/active-filters/active-filters.component";
import { MaxAgeRange, MaxExpRange, MaxSalaryRange } from "../../search-talent/search-talent/search-talent.component";
import { DegreeLevel } from "../models/filter-datamodel";
import { FilterForm } from "../models/form.models";
import { IHomeQueryStore } from "../../../store/home-query.store";
import { IsCorporateUser } from "../../../shared/enums/app.enums";

export function generateFilterBadges(filters: FilterForm | null, homeStore: IHomeQueryStore | null): FilterBadge[] {
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
      let vlaueWithLabel = `${labelPrefix}: ${range[0]} - ${range[1]}`
      if(id === "experience" && range[0] === 0 && range[1] === 0) {
        vlaueWithLabel = `${labelPrefix}: Freshers`;
      }
      addBadge(id, vlaueWithLabel, id, range);
    }
  };

  const handleArray = (
    idPrefix: string,
    labelPrefix: string,
    items: SelectItem[] | null
  ) => {
    items?.forEach((item) => {
      addBadge(`${idPrefix}`, `${labelPrefix}: ${item.label} ${item.extraParam ? ' (' + item.extraParam + 'years)' : ''}`, idPrefix, item);
    });
  };

  const handleBoolean = (id: string, label: string, value: boolean | undefined) => {
    if (value) {
      addBadge(id, label, id, true);
    }
  };
  
  if (filters.shortlist) {
    addBadge("shortlist", `Shortlist: ${filters.shortlist.name}`, "shortlist", filters.shortlist.name)
  }

  if (filters.purchaseListId && localStorage.getItem(IsCorporateUser) === "true") {
    addBadge("purchaseListId", `Purchase List: ${homeStore?.filters.category?.category.categoryName}`, "purchaseList", filters.purchaseListId);
  }

  if (filters.isAlreadyPurchased) {
    addBadge("isAlreadyPurchased", "Already Purchased", "alreadyPurchased", true);
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

  if(filters.examTitle){
    addBadge("examTitle", `Exam Title: ${filters.examTitle}`, "examTitle", filters.examTitle);
  }

  handleArray("courses", "Course", filters.courses);
  handleArray("institutes", "Institute", filters.institutes);
  handleArray("skills", "Skill", filters.skills);
  handleArray("industries", "Industry", filters.industries);
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
export const ExamOptions: SelectItem[] = 
 [
    { label: 'JSC', value: 'JSC', selectId: '-2'},
    { label: 'JDC', value: 'JDC (Madrasah)', selectId: '-2' },
    { label: '8 Pass', value: '8 Pass', selectId: '-2' },
    { label: 'SSC', value: 'SSC' , selectId: '1' },
    { label: 'O Level', value: 'O Level', selectId: '1' },
    { label: 'Dakhil (Madrasah)', value: 'Dakhil (Madrasah)', selectId: '1' },
    { label: 'SSC Vocational', value: 'SSC Vocational', selectId: '1' },
    { label: 'HSC', value: 'HSC', selectId:'2' },
    { label: 'A Level', value: 'A Level',selectId:'2' },
    { label: 'Alim (Madrasah)', value: 'Alim (Madrasah)', selectId:'2' },
    { label: 'HSC Vocational', value: 'HSC Vocational', selectId:'2' },
    { label: 'HSC (BMT)', value: 'HSC (BMT)', selectId:'2' },
    { label: 'Diploma in Engineering', value: 'Diploma in Engineering', selectId:'3' },
    { label: 'Diploma in Medical Technology', value: 'Diploma in Medical Technology', selectId:'3' },
    { label: 'Diploma in Nursing', value: 'Diploma in Nursing', selectId:'3' },
    { label: 'Diploma in Commerce', value: 'Diploma in Commerce', selectId:'3' },
    { label: 'Diploma in Business Studies', value: 'Diploma in Business Studies', selectId:'3' },
    { label: 'Post Graduate Diploma (PGD)', value: 'Post Graduate Diploma (PGD)', selectId:'3' },
    { label: 'Diploma in Pathology', value: 'Diploma in Pathology', selectId:'3' },
    { label: 'Diploma (Vocational)', value: 'Diploma (Vocational)', selectId:'3' },
    { label: 'Diploma in Hotel Management', value: 'Diploma in Hotel Management', selectId:'3' },
    { label: 'Diploma in Computer', value: 'Diploma in Computer', selectId:'3' },
    { label: 'Diploma in Mechanical', value: 'Diploma in Mechanical', selectId:'3' },
    { label: 'Diploma in Refrigeration and air Conditioning', value: 'Diploma in Refrigeration and air Conditioning', selectId:'3' },
    { label: 'Diploma in Electrical', value: 'Diploma in Electrical', selectId:'3' },
    { label: 'Diploma in Automobile', value: 'Diploma in Automobile', selectId:'3' },
    { label: 'Diploma in Power', value: 'Diploma in Power', selectId:'3' },
    { label: 'Diploma in Electronics', value: 'Diploma in Electronics', selectId:'3' },
    { label: 'Diploma in Architecture', value: 'Diploma in Architecture', selectId:'3' },
    { label: 'Diploma in Electro medical', value: 'Diploma in Electro medical', selectId:'3' },
    { label: 'Diploma in Civil', value: 'Diploma in Civil', selectId:'3' },
    { label: 'Diploma in Marine Engineering', value: 'Diploma in Marine Engineering', selectId:'3' },
    { label: 'Diploma in Medical', value: 'Diploma in Medical', selectId:'3' },
    { label: 'Diploma in Midwifery', value: 'Diploma in Midwifery',selectId:'3' },
    { label: 'Diploma in Medical Ultrasound', value: 'Diploma in Medical Ultrasound', selectId:'3' },
    { label: 'Diploma in Health Technology and Services', value: 'Diploma in Health Technology and Services', selectId:'3' },
    { label: 'Diploma in Agriculture', value: 'Diploma in Agriculture', selectId:'3' },
    { label: 'Diploma in Fisheries', value: 'Diploma in Fisheries', selectId:'3' },
    { label: 'Diploma in Livestock', value: 'Diploma in Livestock', selectId:'3' },
    { label: 'Diploma in Forestry', value: 'Diploma in Forestry', selectId:'3' },
    { label: 'Diploma in Textile Engineering', value: 'Diploma in Textile Engineering', selectId:'3' },
    { label: 'Certificate in Marine Trade', value: 'Certificate in Marine Trade', selectId:'3' },
    { label: 'Diploma in Medical Technology (Physiotherapy)', value: 'Diploma in Medical Technology (Physiotherapy)', selectId:'3' },
    { label: 'Diploma in Glass & Ceramic Technology', value: 'Diploma in Glass & Ceramic Technology', selectId:'3' },
    { label: 'Diploma in Culinary Art', value: 'Diploma in Culinary Art', selectId:'3' },
    { label: 'Bachelor degree in any discipline', value: 'Bachelor degree in any discipline', selectId:'4' },
    { label: 'Bachelor of Science (BSc)', value: 'Bachelor of Science (BSc)', selectId:'4' },
    { label: 'Bachelor of Arts (BA)', value: 'Bachelor of Arts (BA)', selectId:'4' },
    { label: 'Bachelor of Commerce (BCom)', value: 'Bachelor of Commerce (BCom)', selectId:'4' },
    { label: 'Bachelor of Commerce (Pass)', value: 'Bachelor of Commerce (Pass)', selectId:'4' },
    { label: 'Bachelor of Business Administration (BBA)', value: 'Bachelor of Business Administration (BBA)', selectId:'4' },
    { label: 'Bachelor of Medicine and Bachelor of Surgery(MBBS)', value: 'Bachelor of Medicine and Bachelor of Surgery(MBBS)', selectId:'4' },
    { label: 'Bachelor of Dental Surgery (BDS)', value: 'Bachelor of Dental Surgery (BDS)', selectId:'4' },
    { label: 'Bachelor of Architecture (B.Arch)', value: 'Bachelor of Architecture (B.Arch)', selectId:'4' },
    { label: 'Bachelor of Pharmacy (B.Pharm)', value: 'Bachelor of Pharmacy (B.Pharm)', selectId:'4' },
    { label: 'Bachelor of Education (B.Ed)', value: 'Bachelor of Education (B.Ed)', selectId:'4' },
    { label: 'Bachelor of Physical Education (BPEd)', value: 'Bachelor of Physical Education (BPEd)', selectId:'4' },
    { label: 'Bachelor of Law (LLB)', value: 'Bachelor of Law (LLB)', selectId:'4' },
    { label: 'Doctor of Veterinary Medicine (DVM)', value: 'Doctor of Veterinary Medicine (DVM)', selectId:'4' },
    { label: 'Bachelor of Social Science (BSS)', value: 'Bachelor of Social Science (BSS)', selectId:'4' },
    { label: 'Bachelor of Fine Arts (B.F.A)', value: 'Bachelor of Fine Arts (B.F.A)', selectId:'4' },
    { label: 'Bachelor of Business Studies (BBS)', value: 'Bachelor of Business Studies (BBS)', selectId:'4' },
    { label: 'Bachelor of Computer Application (BCA)', value: 'Bachelor of Computer Application (BCA)', selectId:'4' },
    { label: 'Fazil (Madrasah Hons.)', value: 'Fazil (Madrasah Hons.)', selectId:'4' },
    { label: 'Bachelor in Engineering (BEngg)', value: 'Bachelor in Engineering (BEngg)', selectId:'4' },
    { label: 'Bachelor of Science (Pass)', value: 'Bachelor of Science (Pass)', selectId:'4' },
    { label: 'Bachelor of Arts (Pass)', value: 'Bachelor of Arts (Pass)', selectId:'4' },
    { label: 'Bachelor of Law (Pass)', value: 'Bachelor of Law (Pass)', selectId:'4' },
    { label: 'Bachelor of Social Science (Pass)', value: 'Bachelor of Social Science (Pass)', selectId:'4' },
    { label: 'Bachelor of Business Studies (Pass)', value: 'Bachelor of Business Studies (Pass)', selectId:'4' },
    { label: 'Fazil (Madrasah Pass)', value: 'Fazil (Madrasah Pass)', selectId:'4' },
    { label: 'Bachelor of Physiotherapy (BPT)', value: 'Bachelor of Physiotherapy (BPT)', selectId:'4' },
    { label: 'Bachelor of Public Health', value: 'Bachelor of Public Health', selectId:'4' },
    { label: 'Bachelor of Real Estate (BRE)', value: 'Bachelor of Real Estate (BRE)', selectId:'4' },
    { label: 'Masters degree in any discipline', value: 'Masters degree in any discipline', selectId:'5' },
    { label: 'Master of Science (MSc)', value: 'Master of Science (MSc)', selectId:'5' },
    { label: 'Master of Arts (MA)', value: 'Master of Arts (MA)', selectId:'5' },
    { label: 'Master of Commerce (MCom)', value: 'Master of Commerce (MCom)', selectId:'5' },
    { label: 'Master of Business Administration (MBA)', value: 'Master of Business Administration (MBA)', selectId:'5' },
    { label: 'Master of Architecture (M.Arch)', value: 'Master of Architecture (M.Arch)', selectId:'5' },
    { label: 'Master of Pharmacy (M.Pharm)', value: 'Master of Pharmacy (M.Pharm)', selectId:'5' },
    { label: 'Master of Education (M.Ed)', value: 'Master of Education (M.Ed)', selectId:'5' },
    { label: 'Master of Law (LLM)', value: 'Master of Law (LLM)', selectId:'5' },
    { label: 'Master of Social Science (MSS)', value: 'Master of Social Science (MSS)', selectId:'5' },
    { label: 'Master of Fine Arts (M.F.A)', value: 'Master of Fine Arts (M.F.A)', selectId:'5' },
    { label: 'Master of Philosophy (M.Phil)', value: 'Master of Philosophy (M.Phil)', selectId:'5' },
    { label: 'Master of Business Management (MBM)', value: 'Master of Business Management (MBM)', selectId:'5' },
    { label: 'Master of Development Studies (MDS)', value: 'Master of Development Studies (MDS)', selectId:'5' },
    { label: 'Master of Business Studies (MBS)', value: 'Master of Business Studies (MBS)', selectId:'5' },
    { label: 'Masters in Computer Application (MCA)', value: 'Masters in Computer Application (MCA)', selectId:'5' },
    { label: 'Executive Master of Business Administration (EMBA)', value: 'Executive Master of Business Administration (EMBA)', selectId:'5' },
    { label: 'Fellowship of the College of Physicians and Surgeons (FCPS)', value: 'Fellowship of the College of Physicians and Surgeons (FCPS)', selectId:'5' },
    { label: 'Kamil (Madrasah)', value: 'Kamil (Madrasah)', selectId:'5' },
    { label: 'Masters in Engineering (MEngg)', value: 'Masters in Engineering (MEngg)', selectId:'5' },
    { label: 'Masters in Bank Management (MBM)', value: 'Masters in Bank Management (MBM)', selectId:'5' },
    { label: 'Masters in Information Systems Security (MISS)', value: 'Masters in Information Systems Security (MISS)', selectId:'5' },
    { label: 'Master of Information & Communication Technology (MICT)', value: 'Master of Information & Communication Technology (MICT)', selectId:'5' },
    { label: 'Master of Disability Management and Rehabilitation (MDMR)', value: 'Master of Disability Management and Rehabilitation (MDMR)', selectId:'5' },
    { label: 'Master of Physiotherapy (MPT)', value: 'Master of Physiotherapy (MPT)', selectId:'5' },
    { label: 'Master of Professional Banking (MPB)', value: 'Master of Professional Banking (MPB)', selectId:'5' },
    { label: 'Master of Professional Finance (MPF)', value: 'Master of Professional Finance (MPF)', selectId:'5' },
    { label: 'Masters of Professional Human Resource Management (MPHRM)', value: 'Masters of Professional Human Resource Management (MPHRM)', selectId:'5' },
    { label: 'Master of Professional MIS (MPMIS)', value: 'Master of Professional MIS (MPMIS)', selectId:'5' },
    { label: 'Master of Professional Marketing (MPM)', value: 'Master of Professional Marketing (MPM)', selectId:'5' },
    { label: 'PhD', value: 'PhD', selectId:'6' },
 ];
