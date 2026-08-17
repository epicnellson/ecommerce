import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../src/context/CartContext';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../src/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('addToCart', () => {
    it('should add a new item to cart', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = {
        _id: 'prod-1',
        name: 'Test Product',
        price: 99.99,
        image: 'test.jpg',
        countInStock: 10,
      };

      await act(async () => {
        result.current.addToCart(product, 2);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].product).toBe('prod-1');
      expect(result.current.cartItems[0].qty).toBe(2);
    });

    it('should increase quantity when adding existing item', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = {
        _id: 'prod-1',
        name: 'Test Product',
        price: 99.99,
        image: 'test.jpg',
        countInStock: 10,
      };

      await act(async () => {
        result.current.addToCart(product, 1);
      });

      await act(async () => {
        result.current.addToCart(product, 2);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].qty).toBe(3);
    });

    it('should calculate cart total correctly', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product1 = {
        _id: 'prod-1',
        name: 'Product 1',
        price: 50,
        image: 'test1.jpg',
        countInStock: 10,
      };

      const product2 = {
        _id: 'prod-2',
        name: 'Product 2',
        price: 30,
        image: 'test2.jpg',
        countInStock: 5,
      };

      await act(async () => {
        result.current.addToCart(product1, 2);
      });

      await act(async () => {
        result.current.addToCart(product2, 1);
      });

      expect(result.current.cartTotal).toBe(130);
      expect(result.current.cartCount).toBe(3);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = {
        _id: 'prod-1',
        name: 'Test Product',
        price: 50,
        image: 'test.jpg',
        countInStock: 10,
      };

      await act(async () => {
        result.current.addToCart(product, 1);
      });

      expect(result.current.cartItems).toHaveLength(1);

      await act(async () => {
        result.current.removeFromCart('prod-1');
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe('updateQty', () => {
    it('should update item quantity', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = {
        _id: 'prod-1',
        name: 'Test Product',
        price: 50,
        image: 'test.jpg',
        countInStock: 10,
      };

      await act(async () => {
        result.current.addToCart(product, 1);
      });

      await act(async () => {
        result.current.updateQty('prod-1', 5);
      });

      expect(result.current.cartItems[0].qty).toBe(5);
    });

    it('should remove item when quantity set to 0', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = {
        _id: 'prod-1',
        name: 'Test Product',
        price: 50,
        image: 'test.jpg',
        countInStock: 10,
      };

      await act(async () => {
        result.current.addToCart(product, 1);
      });

      await act(async () => {
        result.current.updateQty('prod-1', 0);
      });

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product1 = { _id: 'prod-1', name: 'P1', price: 10, image: '1.jpg', countInStock: 5 };
      const product2 = { _id: 'prod-2', name: 'P2', price: 20, image: '2.jpg', countInStock: 5 };

      await act(async () => {
        result.current.addToCart(product1, 1);
      });
      await act(async () => {
        result.current.addToCart(product2, 1);
      });

      expect(result.current.cartItems).toHaveLength(2);

      await act(async () => {
        result.current.clearCart();
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartTotal).toBe(0);
      expect(result.current.cartCount).toBe(0);
    });
  });
});
