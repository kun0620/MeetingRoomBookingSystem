export interface User {
  id: string;
  email: string;
  is_active: boolean;
  role: 'admin' | 'user';
  created_at: string;
}

export interface DepartmentCode {
  id: string;
  code: string;
  department_name: string;
  role: 'admin' | 'user';
  created_at: string;
}
