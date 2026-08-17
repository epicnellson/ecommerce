import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from '../src/context/CartContext';
import { WishlistProvider } from '../src/context/WishlistContext';
import { AuthProvider } from '../src/context/AuthContext';
import RegisterPage from '../src/pages/RegisterPage';
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  it('should render name, email and password input fields', () => {
    render(<RegisterPage />, { wrapper: AllProviders });
    
    expect(screen.getByText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022')).toBeInTheDocument();
  });

  it('should render create account button', () => {
    render(<RegisterPage />, { wrapper: AllProviders });
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should render login link', () => {
    render(<RegisterPage />, { wrapper: AllProviders });
    
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('should render password requirement text', () => {
    render(<RegisterPage />, { wrapper: AllProviders });
    
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('should update name state on change', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: AllProviders });
    
    const nameInput = screen.getByPlaceholderText(/john doe/i);
    await user.type(nameInput, 'John Doe');
    
    expect(nameInput.value).toBe('John Doe');
  });

  it('should update email state on change', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: AllProviders });
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update password state on change', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper: AllProviders });
    
    const passwordInput = screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022');
    await user.type(passwordInput, 'password123');
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should call API on successful registration', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockResolvedValueOnce({
      data: {
        _id: 'user-1',
        name: 'John Doe',
        email: 'test@example.com',
        token: 'mock-token',
      },
    });

    render(<RegisterPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/john doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.default.post).toHaveBeenCalledWith('/auth/register', {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error message on failed registration', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: 'Email already in use',
        },
      },
    });

    render(<RegisterPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/john doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'existing@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/account with this email already exists/i)).toBeInTheDocument();
    });
  });

  it('should disable button while loading', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockImplementation(() => new Promise(() => {}));

    render(<RegisterPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/john doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('button', { name: /please wait/i })).toBeDisabled();
  });

  it('should navigate to home on successful registration', async () => {
    const user = userEvent.setup();
    
    api.default.post.mockResolvedValueOnce({
      data: {
        _id: 'user-1',
        name: 'John Doe',
        email: 'test@example.com',
        token: 'mock-token',
      },
    });

    render(<RegisterPage />, { wrapper: AllProviders });
    
    await user.type(screen.getByPlaceholderText(/john doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
