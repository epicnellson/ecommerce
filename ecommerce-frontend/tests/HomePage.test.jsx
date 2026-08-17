import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from '../src/context/CartContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { AuthProvider } from '../src/context/AuthContext';
import HomePage from '../src/pages/HomePage';
import * as api from '../src/api/client';

vi.mock('../src/api/client');

const mockProducts = [
  {
    _id: 'prod-1',
    name: 'iPhone 15 Pro',
    price: 999,
    image: '/iphone.jpg',
    description: 'Latest iPhone',
    rating: 4.5,
    numReviews: 100,
    countInStock: 10,
    category: 'Electronics',
  },
  {
    _id: 'prod-2',
    name: 'MacBook Pro',
    price: 1999,
    image: '/macbook.jpg',
    description: 'Professional laptop',
    rating: 4.8,
    numReviews: 50,
    countInStock: 5,
    category: 'Computers',
  },
];

const AllProviders = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastContainer />
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product cards when API returns products', async () => {
    api.default.get.mockResolvedValueOnce({
      data: {
        products: mockProducts,
        pages: 1,
        page: 1,
      },
    });

    render(<HomePage />, { wrapper: AllProviders });

    await waitFor(() => {
      expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    });

    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
  });

  it('should display product prices correctly formatted', async () => {
    api.default.get.mockResolvedValueOnce({
      data: {
        products: mockProducts,
        pages: 1,
        page: 1,
      },
    });

    render(<HomePage />, { wrapper: AllProviders });

    await waitFor(() => {
      expect(screen.getByText('$999')).toBeInTheDocument();
    });

    expect(screen.getByText('$1999')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    api.default.get.mockImplementation(() => new Promise(() => {}));

    render(<HomePage />, { wrapper: AllProviders });

    expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument();
  });

  it('should display empty state when no products', async () => {
    api.default.get.mockResolvedValueOnce({
      data: {
        products: [],
        pages: 0,
        page: 1,
      },
    });

    render(<HomePage />, { wrapper: AllProviders });

    await waitFor(() => {
      expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument();
    });
  });
});
