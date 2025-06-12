export interface AllCategories {
    functionalCategories: FunctionalCategoryData
    specialSkilledCategories: SpecialSkilledCategoryData
}

export interface FunctionalCategoryData{
    accountingFinance:Data
    bankNonBankFinInstitution:Data
    supplyChainProcurement:Data
    educationTraining:Data
    engineerArchitects:Data
    garmentsTextile:Data
    generalManagementAdmin:Data
    itTelecommunication:Data
    marketingSales:Data
    mediaAdvertisementEventMgt:Data
    healthcareMedical:Data
    ngoDevelopment:Data
    researchConsultancy:Data
    receptionistPS:Data
    dataEntryOperatorBPO:Data
    customerServiceCallCentre:Data
    hrOrgDevelopment:Data
    designCreative:Data
    productionOperation:Data
    hospitalityTravelTourism:Data
    beautyCareHealthFitness:Data
    lawLegal:Data
    electricianConstructionRepair:Data
    securitySupportService:Data
    drivingMotorTechnician:Data
    agroPlantAnimalFisheries:Data
    commercial:Data
    companySecretaryRegulatoryAffairs:Data
    pharmaceutical:Data
}

export interface SpecialSkilledCategoryData{
    otherSpecialSkilledJobs:Data
    dataEntryComputerOperator:Data
    mechanicTechnician:Data
    nurse:Data
    waiterWaitress:Data
    pathologistLabAssistant:Data
    electricianElectronicsTechnician:Data
    driver:Data
    chefCook:Data
    housekeeper:Data
    securityGuard:Data
    graphicDesigner:Data
    welder:Data
    plumberPipeFitting:Data
    sewingMachineOperator:Data
    masonConstructionWorker:Data
    cadOperator:Data
    deliveryMan:Data
    garmentsTechnicianMachineOperator:Data
    peon:Data
    cleaner:Data
    gardener:Data
    carpenter:Data
    showroomAssistantSalesman:Data
    salesRepresentativeSR:Data
    imamKhatibMuezzin:Data
    gymFitnessTrainer:Data
    interpreter:Data
    beauticianSalon:Data
    fireSafetyFirefighter:Data
    boilerOperator:Data
    caregiverNanny:Data
    physiotherapist:Data
    others:Data
}

export interface Data{
    id:number
    value:number
    categoryName:string
}
export interface CategoryByIdData {
  catIds: Record<string, number>;
  StarCandidate: {
    StarCandidate: number;
  };
  ImmediatelyAvailable: {
    ImmediatelyAvailable: number;
  };
  lastUpdated: {
    lastUpdated: number;
  };
}
