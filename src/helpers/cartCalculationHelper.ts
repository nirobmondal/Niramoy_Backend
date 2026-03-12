/**
 * Calculate total price from an array of items with price and quantity.
 */
export const calculateCartTotal = (
  items: { price: number | string | { toNumber?: () => number }; quantity: number }[]
): number => {
  const total = items.reduce((sum, item) => {
    const price =
      typeof item.price === "object" && item.price !== null && "toNumber" in item.price
        ? (item.price as any).toNumber()
        : Number(item.price);
    return sum + price * item.quantity;
  }, 0);

  return Math.round(total * 100) / 100;
};
