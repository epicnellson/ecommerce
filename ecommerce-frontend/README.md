# Ecommerce Frontend

A React + Vite frontend for a full-featured ecommerce platform.

## Features

- **Authentication**: Login, register, profile management
- **Products**: Browse, search, filter, pagination, reviews
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout**: Stripe payment integration
- **Orders**: Order history, cancellation
- **Wishlist**: Save items for later
- **Address Book**: Manage shipping addresses
- **Admin Dashboard**: Product and order management with image uploads

## Tech Stack

- React 19
- Vite
- React Router DOM
- Axios
- Framer Motion
- Tailwind CSS
- React Testing Library + Vitest

## Prerequisites

- Node.js 18+
- Running backend API (port 5000)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation

```bash
npm install
```

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Project Structure

```
src/
├── api/          # API client configuration
├── components/   # Reusable components
├── context/       # React contexts (Auth, Cart, Wishlist)
├── pages/        # Page components
├── utils/        # Utility functions
└── App.jsx       # Main app with routing
```

## Testing

The frontend uses Vitest + React Testing Library.

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run tests with interactive UI
npm run test:ui
```

### Writing Tests

Tests are located in the `tests/` directory. Use the following patterns:

```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('Component', () => {
  it('should render', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Key Pages

- `/` - Home (product listing)
- `/product/:id` - Product details
- `/login` - User login
- `/register` - User registration
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Order history
- `/wishlist` - Wishlist
- `/profile` - User profile
- `/profile/addresses` - Address book
- `/admin` - Admin dashboard
- `/admin/products` - Product management

## License

ISC
