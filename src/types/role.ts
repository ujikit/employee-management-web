export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RoleResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: Role[];
}
