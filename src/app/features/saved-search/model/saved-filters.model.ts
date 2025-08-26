export type CardType = 'SavedFilter' | 'ShortlistedCv';
export const SavedFilter = 'SavedFilter';
export const ShortlistedCv = 'ShortlistedCv';

export interface SavedFilterApiResponse{
    type: typeof SavedFilter
    id:string
    companyId:string
    numberOfCVs:number
    createdOn:string
    filterId:number
    filterName:string
    filters:Record<string,string>
}

export interface ShortlistedCvApiResponse {
    type: typeof ShortlistedCv
    id:string
    companyId:string
    groupId:number
    groupName:string
    groupDescription:string
    numberOfCVs:number
    createdOn:string
}

export class SavedSearchCard{
    type: CardType
    id:string
    companyId:string
    filterId:number | undefined;
    groupId: number | undefined;
    title:string;
    description:string | undefined
    filters:Record<string,string> | undefined;
    numberOfCVs:number
    createdOn:string

    constructor(data: SavedFilterApiResponse | ShortlistedCvApiResponse) {
        this.type = data.type
        this.id = data.id
        this.companyId = data.companyId
        this.filterId = data.type === SavedFilter ? data.filterId : undefined;
        this.groupId = data.type === ShortlistedCv ? data.groupId : undefined;
        this.title = data.type === SavedFilter ? data.filterName : data.groupName;
        this.description = data.type === ShortlistedCv ? data.groupDescription :undefined;
        this.numberOfCVs = data.numberOfCVs
        this.createdOn = data.createdOn
        this.filters = data.type === SavedFilter ? this.genFiltersFromOldObject(data.filters) : undefined;
    }

    private genFiltersFromOldObject(filters: Record<string, string>): Record<string, string> {
        if (filters['AgeMax'] && filters['AgeMin']) {
            filters['qAge'] = `${filters['AgeMin']}/${filters['AgeMax']}`;
            delete filters['AgeMax'];
            delete filters['AgeMin'];
        }
        if(filters['ExpFrom'] && filters['ExpTo']){
            filters['qExp'] = `${filters['ExpFrom']}/${filters['ExpTo']}`
            delete filters['ExpFrom'];
            delete filters['ExpTo']
        }
        if(filters['catID']){
            filters['CatId'] = filters['catID']
            delete filters['catID']
        }
        if(filters['eduLevel']){
            filters['qEduLevel'] = filters['eduLevel']
            delete filters['eduLevel']
        }
        if(filters['Major']){
            filters['qDegree'] = filters['Major']
            delete filters['Major']
        }
        if(filters['Institute']){
            filters['InsName'] = filters['Institute']
            delete filters['Institute']
        }
        if(filters['Skill']){
            filters['qOrgType'] = filters['Skill']
            delete filters['Skill']
        }
        if(filters['keyword']){
            filters['qKeyword'] = filters['keyword']
            delete filters['keyword']
        }
        if(filters['keywordFilterType']){
            filters['qkeywordfiltertype'] = filters['keywordFilterType']
            delete filters['keywordFilterType']
        }
        if(filters['PerferedLevel']){
            filters['qPref'] = filters['PerferedLevel']
            delete filters['PerferedLevel']
        }
        if(filters['Gender']){
            if(filters['Gender'] === 'M'|| filters['Gender'] === 'F'|| filters['Gender'] === 'O'){
                filters['qSex'] = filters['Gender']
            }
            delete filters['Gender']
        }
        return filters;
    }
}

export interface EditSaveFilterInputRequestBody{
    id: string
    criteriaName:string
    CpId:string
    IsInsert:number
} 
export interface EditShortlistedInputRequestBody{
    id: string
    categoryName:string
    CpId:string
    categoryDescription:string
    IsInsert:number
} 


