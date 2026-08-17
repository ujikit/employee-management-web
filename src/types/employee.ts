export type PositionType = "MANAGER" | "STAFF" | string;

export interface EducationInput {
  education_level: string;
  school_name: string;
  graduation_year: number;
}

export interface CreateEmployeePayload {
  nip: string;
  name: string;
  email: string;
  phone: string;
  birth_place: string;
  district_id: number;
  full_address: string;
  distance_km: number;
  birth_date: string;
  marital_status: string;
  children_count: number;
  joined_at: string;
  position_id: number;
  department_id: number;
  employment_type: string;
  status: string;
  educations: EducationInput[];
}
export interface Position {
  id: number;
  code: string;
  name: string;
  position_type: PositionType;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  nip: string;
  name: string;
  email: string;
  phone: string;
  photo_path: string | null;
  birth_place: string;
  birth_date: string;
  marital_status: string;
  children_count: number;
  joined_at: string;
  position_id: number;
  department_id: number;
  employment_type: string;
  gender: string;
  distance_km: number;
  district_id: number;
  full_address: string;
  status: string;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  position?: Position | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  sort_by?: string;
  sort_order?: string;
}

export interface EmployeeResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: Employee[];
  meta: PaginationMeta;
}
