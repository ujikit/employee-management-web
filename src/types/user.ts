export interface UserItem {
  id: number;
  name: string;
  username: string;
  email?: string;
  role: string;
  role_id?: number;
  status: string;
}

export interface UserPaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  sort_by?: string;
  sort_order?: string;
}

export interface UserListResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: UserItem[];
  meta: UserPaginationMeta;
}
