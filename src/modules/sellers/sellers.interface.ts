export interface CreateSellerProfileInput {
  storeName: string;
  storeLogo?: string;
  address: string;
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  offDay: string;
}

export interface UpdateSellerProfileInput {
  storeName?: string;
  storeLogo?: string;
  address?: string;
  contactNumber?: string;
  openingTime?: string;
  closingTime?: string;
  offDay?: string;
}

export interface CreateMedicineInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  manufacturer?: string;
  imageUrl?: string;
  dosageForm: string;
  strength?: string;
  categoryId: string;
}

export interface UpdateMedicineInput {
  name?: string;
  description?: string;
  price?: number;
  manufacturer?: string;
  imageUrl?: string;
  dosageForm?: string;
  strength?: string;
  categoryId?: string;
}

export interface SellerOrderQuery {
  page?: string;
  limit?: string;
  status?: string;
}

export interface SellerMedicineQuery {
  page?: string;
  limit?: string;
  search?: string;
}
