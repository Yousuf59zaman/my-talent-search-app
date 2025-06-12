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
        this.filters = data.type === SavedFilter ? data.filters : undefined;
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


