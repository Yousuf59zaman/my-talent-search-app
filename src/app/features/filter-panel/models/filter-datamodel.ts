import { SelectItem } from "../../../shared/models/models";

export interface SearchCountResponse {
  catIds: { [key: string]: number };
  jobLevels: {
    Entry: number;
    Mid: number;
    Top: number;
  };
  industries: { [key: string]: number };
  majosSubject: { [key: string]: number };
  eduLevels: { [key: string]: number };
  StarCandidate: {
    StarCandidate: number;
  };
  PersonWithDisability: {
    PersonWithDisability: number;
  };
  ImmediatelyAvailable: {
    ImmediatelyAvailable: number;
  };
  ForeignInstitute: {
    ForeignInstitute: number;
  };
}

export type SearchCountObject = {
  categories: SelectItem[];
  eduLevels: SelectItem[];
  courses: SelectItem[];
  industries: SelectItem[];
}
export interface LocationQueryParams {
  searchtext: string;
  isBlueCollar: boolean;
  combineLocation: boolean;
}

export type MajorSubRes = { majSubId: number; majSubName: string }

export type IndustryOrExpertiseResponse = {
  id: number,
  name: string
}
export type InstituteResponse = {
  instituteId: number,
  instituteName: string
}
export type IndustryTypeResponse = {
  orG_TYPE_ID: number,
  orG_TYPE_NAME: string,
  orG_TYPE_NAME_BNG: string
}

export type SkillResponse = {
  id: number,
  value: string
}

// Static mapping of category IDs to names
export const CATEGORY_MAP: { [key: string]: string } = {
  "1": "Accounting/Finance",
  "2": "Bank/Non-Bank Fin. Institution",
  "3": "Supply Chain/Procurement",
  "4": "Education/Training",
  "5": "Engineer/Architect",
  "6": "Garments/Textile",
  "7": "General Management/Admin",
  "8": "IT/Telecommunication",
  "9": "Marketing/Sales",
  "10": "Media/Advertisement/Event Mgt.",
  "11": "Healthcare/Medical",
  "12": "NGO/Development",
  "13": "Research/Consultancy",
  "14": "Receptionist/ PS",
  "15": "Data Entry/Operator/BPO",
  "16": "Customer Service/Call Centre",
  "17": "HR/Org. Development",
  "18": "Design/Creative",
  "19": "Production/Operation",
  "20": "Hospitality/ Travel/ Tourism",
  "21": "Beauty Care/ Health & Fitness",
  "22": "Law/Legal",
  "23": "Electrician/ Construction/ Repair",
  "24": "Security/Support Service",
  "25": "Driving/Motor Technician",
  "26": "Agro (Plant/Animal/Fisheries)",
  "27": "Commercial",
  "28": "Company Secretary/Regulatory affairs",
  "29": "Pharmaceutical",
  "-10": "Others",
  "-11":"Other Special Skilled Jobs",
  "61": "Data Entry/Computer Operator",
  "62": "Mechanic/Technician",
  "63": "Nurse",
  "64": "Waiter/Waitress",
  "65": "Pathologist/ Lab Assistant",
  "66": "Electrician/Electronics Technician",
  "67": "Driver",
  "68": "Chef/Cook",
  "69": "Housekeeper",
  "70": "Security Guard",
  "71": "Graphic Designer",
  "72": "Welder",
  "73": "Plumber/Pipe fitting",
  "74": "Sewing machine operator",
  "75": "Mason/ Construction worker",
  "76": "CAD Operator",
  "77": "Delivery Man",
  "78": "Garments technician/Machine operator",
  "79": "Peon",
  "80": "Cleaner",
  "81": "Gardener",
  "82": "Carpenter",
  "83": "Showroom Assistant/Salesman",
  "84": "Sales Representative (SR)",
  "85": "Imam/ Khatib/ Muezzin",
  "86": "Gym/ Fitness Trainer",
  "87": "Interpreter",
  "88": "Beautician/ Salon",
  "89": "Fire Safety/ Firefighter",
  "90": "Boiler Operator",
  "91": "Caregiver/Nanny",
  "92": "Physiotherapist",
  "93": "Home Tutor",
  "94": "Labor",
  "95": "Photographer",
  "96": "Video Editor",
  "97": "Interior Decorator",
  "98": "Event Manager",
  "99": "Personal Assistant (PA)",
  "100": "Personal Security",
  "101": "Maid",
  "102": "Painter",
  "103": "AC Technician",
  "104": "Language Instructor",
  "105": "Apartment Caretaker",
  "106": "Cashier"
};


export const DegreeLevel = [
  {
      label: "PSC/5 pass",
      value: -3
  },
  {
      label: "JSC/JDC/8 pass",
      value: -2
  },
  {
      label: "Secondary",
      value: 1
  },
  {
      label: "Higher Secondary",
      value: 2
  },
  {
      label: "Diploma",
      value: 3
  },
  {
      label: "Bachelor/Honors",
      value: 4
  },
  {
      label: "Masters",
      value: 5
  },
  {
      label: "PhD (Doctor of Philosophy)",
      value: 6
  },
]


export interface SaveFilterRequest {
  isInsert: number;
  id?: string;
  cpId: string;
  criteriaId?: number;
  criteriaName: string;
  parameters: Record<string, string>;
  cvCount: number;
}