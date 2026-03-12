export interface CheckoutInput {
  shippingAddress: string;
  shippingCity: string;
  phone: string;
  notes?: string;
}

export interface OrderQuery {
  page?: string;
  limit?: string;
  status?: string;
}
