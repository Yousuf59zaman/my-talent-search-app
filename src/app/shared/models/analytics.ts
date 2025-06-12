export interface JobDetails {
    applicants: number;
    steps: number;
    schedule: number;
    notified: number;
    hired: number;
    viewed: number;
    notViewed: number;
    rejected: number;
    present: number;
    absent: number;
    notMarked: number;
    willCome: number;
    notCome: number;
    rescheduled: number;
    noAction: number;
    onlySeen: number;
    jobStatus: string;
    belowFifty: number;
    matchedFifty: number;
    matchedSeventyFive: number;
    matchedHundred: number;
    summaryTableResponses: SummaryTableResponse[];
  }

  export interface SummaryTableResponse {
    stepName: string;
    numberOfSchedules: number;
    notified: number;
    noAction: number;
    onlySeen: number;
    willCome: number;
    notCome: number;
    askedForReschedules: number;
    present: number;
    absent: number;
    comments: number;
  }