import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from '../src/context/CartContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { AuthProvider } from '../src/context/AuthContext';
import LoginPage from '../src/pages/LoginPage';
import * as api from '../src/api/client';

vi.mock('../src/api/client');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  it('should render email and password input fields', () => {
    render(<LoginPage />, { wrapper: AllProviders });
    
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022')).toBeInTheDocument();
  });

  it('should render sign in button', () => {
    render(<LoginPage />, { wrapper: AllProviders });
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<LoginPage />, { wrapper: AllProviders });
    
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('should render register link', () => {
    render(<LoginPage />, { wrapper: AllProviders });
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('should update email state on change', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: AllProviders });
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update password state on change', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: AllProviders });
    
    const passwordInput = screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022');
    await user.type(passwordInput, 'password123');
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should call API on successful login', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockResolvedValueOnce({
      data: {
        _id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        token: 'mock-token',
      },
    });

    render(<LoginPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.default.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error message on failed login', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid email or password',
        },
      },
    });

    render(<LoginPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should disable button while loading', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /please wait/i })).toBeDisabled();
  });
});
