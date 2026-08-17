import { calculateTotal, calculateOrderPrices } from '../src/utils/pricingService.js';

describe('pricingService', () => {
  describe('calculateTotal', () => {
    it('should calculate total for single item', () => {
      const items = [{ price: 100, qty: 1 }];
      const result = calculateTotal(items);
      
      expect(result.itemsPrice).toBe(100);
      expect(result.shippingPrice).toBe(5); // 100 * 0.05
      expect(result.taxPrice).toBe(10.5); // (100 + 5) * 0.1
      expect(result.totalPrice).toBe(115.5);
    });

    it('should calculate total for multiple items', () => {
      const items = [
        { price: 50, qty: 2 },
        { price: 100, qty: 1 }
      ];
      const result = calculateTotal(items);
      
      expect(result.itemsPrice).toBe(200); // 50*2 + 100*1
      expect(result.shippingPrice).toBe(10); // 200 * 0.05
      expect(result.taxPrice).toBe(21); // (200 + 10) * 0.1
      expect(result.totalPrice).toBe(231);
    });

    it('should handle empty items array', () => {
      const result = calculateTotal([]);
      
      expect(result.itemsPrice).toBe(0);
      expect(result.totalPrice).toBe(0);
    });

    it('should handle null/undefined', () => {
      const result = calculateTotal(null);
      
      expect(result.itemsPrice).toBe(0);
      expect(result.totalPrice).toBe(0);
    });
  });

  describe('calculateOrderPrices', () => {
    it('should calculate prices correctly', () => {
      const items = [{ price: 100, qty: 2 }];
      const result = calculateOrderPrices(items);
      
      expect(result.itemsPrice).toBe(200);
      expect(result.totalPrice).toBe(231);
    });
  });
});
