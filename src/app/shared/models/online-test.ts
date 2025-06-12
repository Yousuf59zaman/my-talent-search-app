import { FormControl, FormGroup } from "@angular/forms";

export interface OnlineTestInformationSave {
    jobId: number;
    levelStatus: number;
    examDate: string;
    examDuration: number;
    examType: string;
    mcqExamType: string;
    noOfMCQQuestions?: string;
    isNegativeMarks: boolean;
    negativeMarks?: string;
    isQuestionDelete: boolean;
    descTotalMarks?: string;
    examPassMarks?: string;
    examProctoring?: number;
    schId?: number;
    comUsrAcc?: string;
    companyId: string;
  }
  
  export interface OnlineTestInfoForm {
    jobId: FormControl<number | null>;
    levelStatus: FormControl<number | null>;
    examDate: FormControl<Date | null>;
    examDuration: FormControl<number | null>;
    examType: FormControl<string | null>;
    mcqExamType: FormControl<string | null>;
    noOfMCQQuestions: FormControl<string | null>;
    isNegativeMarks: FormControl<boolean | null>;
    negativeMarks: FormControl<string | null>;
    isQuestionDelete: FormControl<boolean>;
    descTotalMarks: FormControl<string | null>;
    examPassMarks: FormControl<string | null>;
    examProctoring: FormControl<number | null>;
    schId: FormControl<number | null>;
    comUsrAcc: FormControl<string | null>;
    companyId: FormControl<string | null>;
  }
  
  export interface OnlineTestInformationGet {
    scheduleID: number;
    examID: number;
    examDuration: number;
    totalQuestions: string;
    totalMarks: number;
    wrongMarks: number;
    examDateTime: string;  // Can be changed to `Date` if you're using date objects
    examName: string;
    examType: string;
    questionSourceType: string;
    questionConfirmed: boolean;
  }