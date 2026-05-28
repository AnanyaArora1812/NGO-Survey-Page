export enum SurveyStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  ASSIGNED = "ASSIGNED",
  COMPLETED = "COMPLETED",
  CRITICAL = "CRITICAL",
}

export enum SurveyPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IssueCategory {
  SANITATION = "SANITATION",
  HEALTHCARE = "HEALTHCARE",
  EDUCATION = "EDUCATION",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  WATER_SUPPLY = "WATER_SUPPLY",
  HOUSING = "HOUSING",
  LIVELIHOOD = "LIVELIHOOD",
  WOMEN_SAFETY = "WOMEN_SAFETY",
  CHILD_WELFARE = "CHILD_WELFARE",
  OTHER = "OTHER",
}

export interface Survey {
  id: string;
  citizenName: string;
  citizenPhone?: string;
  citizenAadhaarLast4?: string;
  location: SurveyLocation;
  issueCategory: IssueCategory;
  issueDescription: string;
  priority: SurveyPriority;
  status: SurveyStatus;
  assignedVolunteer?: AssignedVolunteer;
  submissionDate: string;
  lastUpdated: string;
  ocrConfidenceScore?: number;
  attachments?: SurveyAttachment[];
  adminNotes?: string;
}

export interface SurveyLocation {
  district: string;
  taluk: string;
  village: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AssignedVolunteer {
  id: string;
  name: string;
  phone: string;
  zone: string;
}

export interface SurveyAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface SurveyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: SurveyStatus | "";
  priority?: SurveyPriority | "";
  issueCategory?: IssueCategory | "";
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SurveyListResponse = PaginatedResponse<Survey>;

export interface UpdateStatusPayload {
  surveyId: string;
  status: SurveyStatus;
  adminNotes?: string;
}

export interface AssignVolunteerPayload {
  surveyId: string;
  volunteerId: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface VolunteerOption {
  id: string;
  name: string;
  phone: string;
  zone: string;
  activeAssignments: number;
}
