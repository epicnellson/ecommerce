const TAX_RATE = 0.1;
const SHIPPING_RATE = 0.05;

function calculateOrderPrices(items) {
  if (!items || items.length === 0) {
    return { itemsPrice: 0, taxPrice: 0, shippingPrice: 0, totalPrice: 0 };
  }

  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice = itemsPrice * SHIPPING_RATE;
  const taxPrice = (itemsPrice + shippingPrice) * TAX_RATE;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    itemsPrice: Math.round(itemsPrice * 100) / 100,
    taxPrice: Math.round(taxPrice * 100) / 100,
    shippingPrice: Math.round(shippingPrice * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
}

function calculateTotal(items) {
  return calculateOrderPrices(items);
}

function formatPriceForStripe(price) {
  return Math.round(price * 100);
}

export { calculateOrderPrices, calculateTotal, formatPriceForStripe, TAX_RATE, SHIPPING_RATE };
