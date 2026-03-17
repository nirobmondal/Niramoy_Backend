export interface MedicineQuery {
  search?: string;
  categoryId?: string;
  manufacturerId?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}
