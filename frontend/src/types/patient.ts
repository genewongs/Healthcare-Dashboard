export type PatientStatus = "active" | "inactive" | "pending" | "discharged";

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
  blood_type: string | null;
  allergies: string | null;
  conditions: string | null;
  status: PatientStatus;
  last_visit: string | null;
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
  blood_type?: string | null;
  allergies?: string | null;
  conditions?: string | null;
  status?: PatientStatus;
  last_visit?: string | null;
};

export type PatientUpdate = Partial<PatientCreate>;

export type PatientListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: PatientStatus;
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
  created_at: string;
};

export type PatientNoteCreate = {
  timestamp?: string | null;
  content: string;
};

export type PatientSummary = {
  patient_id: number;
  summary: string;
};

