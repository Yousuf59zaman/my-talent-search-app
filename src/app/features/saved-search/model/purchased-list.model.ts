export interface PurchasedList {
    id:string
    companyId:string
    listId:number
    listName:string
    listDescription:string
    purchased:number
    wishlist:number
    createdOn:string
}
export interface EditPurchasedListInputRequestBody {
    id: string
    PurchaseListName : string
    PurchaseListDescription : string
    CpId:string
}