export type PatientStatus = "active" | "inactive" | "pending" | "discharged";
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type PatientNoteCategory = "general" | "medication" | "follow_up" | "concern";

export type PatientSortField =
  | "id"
  | "first_name"
  | "last_name"
  | "date_of_birth"
  | "status"
  | "last_visit"
  | "created_at"
  | "updated_at";

export type SortOrder = "asc" | "desc";

export type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: BloodType | null;
  allergies: string[];
  conditions: string | null;
  status: PatientStatus;
  last_visit: string;
  created_at: string;
  updated_at: string;
};

export type PatientCreate = {
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  blood_type?: BloodType | null;
  allergies?: string[];
  conditions?: string | null;
  status: PatientStatus;
  last_visit: string;
};

export type PatientUpdate = PatientCreate;

export type PatientListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: PatientStatus;
  age_min?: number;
  age_max?: number;
  last_visit_from?: string;
  last_visit_to?: string;
  sort_by?: PatientSortField;
  sort_order?: SortOrder;
};

export type PaginatedPatients = {
  items: Patient[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type PatientNote = {
  id: number;
  patient_id: number;
  timestamp: string;
  content: string;
  category: PatientNoteCategory;
  isPinned: boolean;
  created_at: string;
};

export type PatientNoteCreate = {
  timestamp?: string | null;
  content: string;
  category: PatientNoteCategory;
  isPinned: boolean;
};

export type PatientNoteUpdate = {
  isPinned?: boolean;
};

export type PatientSummary = {
  patient_id: number;
  summary: string;
};
