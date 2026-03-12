export interface MedicineQuery {
  search?: string;
  category?: string;
  manufacturer?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}
