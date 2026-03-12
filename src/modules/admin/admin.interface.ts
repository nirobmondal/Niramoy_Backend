export interface AdminUserQuery {
  role?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export interface AdminOrderQuery {
  status?: string;
  date?: string;
  seller?: string;
  page?: string;
  limit?: string;
}

export interface AdminMedicineQuery {
  search?: string;
  seller?: string;
  category?: string;
  page?: string;
  limit?: string;
}
