/**
 * Calculate total price for an order from cart items.
 */
export const calculateOrderTotal = (
  items: { price: number | string; quantity: number }[]
): number => {
  const total = items.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  return Math.round(total * 100) / 100;
};

/**
 * Calculate subtotal for a single line item.
 */
export const calculateLineSubtotal = (
  price: number,
  quantity: number
): number => {
  return Math.round(price * quantity * 100) / 100;
};
