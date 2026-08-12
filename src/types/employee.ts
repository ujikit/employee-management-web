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
}

export interface EmployeeResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: Employee[];
}
