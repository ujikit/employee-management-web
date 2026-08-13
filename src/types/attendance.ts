import { Employee } from "./employee";

export interface Attendance {
  id: number;
  employee_id: number;
  attendance_import_id: number;
  attendance_date: string;
  checkin_at: string;
  checkout_at: string;
  checkin_location: string;
  checkout_location: string;
  attendance_type: string;
  duration_hours: number;
  status: string;
  verification_status: string | null;
  verified_by_role: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface AttendanceResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: Attendance[];
}
