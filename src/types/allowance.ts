import { Employee } from "./employee";

export interface AllowancePeriod {
  id: number;
  period_year: number;
  period_month: number;
  total_recipients: number;
  total_amount: number;
  status: string;
  calculated_by: number;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PeriodResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: AllowancePeriod[];
}

export interface AllowanceDetail {
  id: number;
  period_id: number;
  employee_id: number;
  base_fare: number;
  original_km: number;
  rounded_km: number;
  attendance_days: number;
  nominal: number;
  eligibility_status: string;
  calculation_note: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface DetailResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: AllowanceDetail[];
}

export interface AllowanceSetting {
  id: number;
  base_fare: number;
  effective_start: string;
  min_km: number;
  max_km: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SettingResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: AllowanceSetting[];
}
