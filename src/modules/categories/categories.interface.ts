export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export interface CategoryQuery {
  page?: string;
  limit?: string;
  search?: string;
}
