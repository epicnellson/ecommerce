# ShopZone - MERN Ecommerce Platform

A full-featured ecommerce platform built with the MERN stack (MongoDB, Express, React, Node.js). The application supports user authentication (email/password + social login), product browsing with search and filters, shopping cart, wishlist, checkout with Stripe payments, order management, address book, product reviews, and an admin dashboard with sales analytics.

---

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router DOM 7** - Routing
- **React Context** - State management (Auth, Cart, Wishlist)
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **react-toastify** - Notifications
- **Vitest + React Testing Library** - Testing

### Backend
- **Node.js 18+** - Runtime
- **Express.js 5** - Web framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT (jsonwebtoken)** - Authentication
- **Passport.js** - Social OAuth (Google, Facebook)
- **Stripe** - Payments
- **Nodemailer** - Email sending
- **Cloudinary** - Image storage
- **Helmet + CORS** - Security
- **Morgan** - Request logging
- **Jest** - Testing

---

## Features

### Customer Features

- **Product Catalog** - Browse products with pagination (12 per page), search by name/description, filter by category/brand/price range/rating, sort by price/rating/newest
- **Shopping Cart** - Add/remove items, update quantities, persists to localStorage, syncs to database when logged in, validates stock before checkout
- **Wishlist** - Save products for later, move items to cart
- **Checkout** - Stripe-hosted payment page, address selection, order summary
- **Order History** - View past orders with status, cancel pending orders
- **Address Book** - Multiple shipping addresses, set default address
- **Product Reviews** - Star ratings (1-5) with text reviews, aggregate ratings displayed on product cards

### Auth Features

- **Email/Password** - Registration with validation, login with JWT, password hashing with bcrypt
- **Social Login** - Google and Facebook OAuth via Passport.js
- **Password Reset** - Token-based reset flow with email verification
- **Profile Management** - Update name, email, password

### Admin Features

- **Dashboard** - Sales overview, revenue stats, recent orders, top products, low stock alerts
- **Product Management** - CRUD operations with image upload to Cloudinary
- **Order Management** - View all orders, update status, process full/partial refunds
- **Sales Analytics** - Top products by revenue, sales data visualization

---

## Architecture Overview

```
ecommerce/
├── ecommerce-backend/           # Express.js API server
│   ├── src/
│   │   ├── config/           # DB, passport, Stripe config
│   │   ├── controllers/      # Route handlers (auth, product, order, etc.)
│   │   ├── middleware/        # Auth, error handling, validation
│   │   ├── models/           # Mongoose schemas (User, Product, Order, Cart, etc.)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic (orderService, paymentService, emailService)
│   │   ├── utils/            # Helpers (token, error, pricing, sanitizer)
│   │   ├── scripts/          # Database seed script
│   │   └── server.js         # App entry point
│   ├── tests/                # Jest tests
│   └── package.json
│
├── ecommerce-frontend/        # React SPA
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/      # Reusable UI (AuthComponents, ProductCard, Skeleton, etc.)
│   │   ├── context/         # React Context (AuthContext, CartContext, WishlistContext)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route pages (Home, Product, Cart, Login, Register, etc.)
│   │   ├── utils/          # Helpers (errorMessages)
│   │   ├── App.jsx         # Main component with routing
│   │   └── main.jsx        # Entry point
│   ├── tests/              # Vitest tests
│   └── package.json
│
└── README.md               # This file
```

### Backend Modules

| Module | Description |
|--------|-------------|
| `controllers/` | Request handlers for auth, products, orders, cart, wishlist, payment, admin |
| `models/` | Mongoose schemas with validation and virtuals |
| `routes/` | Express routers defining API endpoints |
| `services/` | Business logic separated from controllers |
| `middleware/` | Auth verification, error handling, request validation |
| `utils/` | Token generation, error classes, pricing calculations |

### Frontend Modules

| Module | Description |
|--------|-------------|
| `pages/` | Full page components (HomePage, ProductPage, CartPage, etc.) |
| `components/` | Reusable UI (ProductCard, AuthComponents, Skeleton, Header, Footer) |
| `context/` | Global state: AuthContext (user, login, logout), CartContext, WishlistContext |
| `api/` | Axios instance with auth interceptors, base URL configuration |
| `hooks/` | Custom React hooks |

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **MongoDB** - Local installation or MongoDB Atlas cloud
- **Stripe** - Account with API keys (test mode)
- **Google OAuth** - Google Cloud Console project (optional)
- **Facebook OAuth** - Meta Developer account (optional)
- **SMTP** - Gmail, SendGrid, etc. for emails (optional)
- **Cloudinary** - For image upload (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecommerce
```

### 2. Backend Setup

```bash
cd ecommerce-backend
npm install
```

Create a `.env` file in `ecommerce-backend/`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/shopzone
# Or Atlas: mongodb+srv://username:password@cluster.mongodb.net/shopzone

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# OAuth (optional - get from Google Cloud Console / Meta Developer)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Email (optional - using Gmail as example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary (optional - get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev          # Development with nodemon
# or
npm start           # Production
```

The API runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ecommerce-frontend
npm install
```

Create a `.env` file in `ecommerce-frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`

### 4. (Optional) Seed Products

```bash
cd ecommerce-backend
npm run seed:products
```

---

## Testing

### Backend Tests

```bash
cd ecommerce-backend
npm test
```

Runs Jest tests. Currently covers pricing service calculations.

### Frontend Tests

```bash
cd ecommerce-frontend
npm run test:run        # Run once
# or
npm test                # Watch mode
```

Uses Vitest + React Testing Library. Currently covers CartContext and HomePage.

---

## Security Notes

- **JWT stored in httpOnly cookies** - Not accessible via JavaScript, protects against XSS
- **Password hashing** - bcrypt with salt rounds
- **Rate limiting** - 100 requests per 15 minutes by default
- **Helmet.js** - Security headers
- **CORS** - Restricted to frontend origin
- **Input validation** - express-validator on all inputs
- **MongoDB injection prevention** - Mongoose parameterized queries

---

## Performance Notes

- **Pagination** - All list endpoints use limit/skip
- **MongoDB indexes** - On email, category, price, createdAt for faster queries
- **Skeleton loading** - Perceived performance improvement on product pages
- **JWT stateless auth** - No session database lookups

---

## API Endpoints Summary

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| **Auth** | `/api/auth/register` | POST | Register new user |
| | `/api/auth/login` | POST | Login user |
| | `/api/auth/logout` | POST | Logout user |
| | `/api/auth/profile` | GET/PUT | Get/update profile |
| | `/api/auth/addresses` | GET/POST | List/add addresses |
| | `/api/auth/forgot-password` | POST | Request password reset |
| | `/api/auth/reset-password/:token` | POST | Reset password |
| **Products** | `/api/products` | GET | List with filters/pagination |
| | `/api/products/:id` | GET | Get single product |
| | `/api/products` | POST | Create product (admin) |
| | `/api/products/:id` | PUT/DELETE | Update/delete (admin) |
| **Cart** | `/api/cart` | GET | Get user cart |
| | `/api/cart` | POST | Add to cart |
| | `/api/cart/:productId` | PUT | Update quantity |
| | `/api/cart/:productId` | DELETE | Remove from cart |
| **Wishlist** | `/api/wishlist` | GET/POST | Get/add wishlist items |
| | `/api/wishlist/:productId` | DELETE | Remove |
| **Orders** | `/api/orders` | POST | Create order |
| | `/api/orders/myorders` | GET | User order history |
| | `/api/orders/:id` | GET | Get order details |
| | `/api/orders/:id/cancel` | PUT | Cancel order |
| | `/api/orders/:id/refund` | PUT | Refund (admin) |
| **Payment** | `/api/payment/create-session` | POST | Create Stripe checkout |
| | `/api/payment/webhook` | POST | Stripe webhook |
| **Admin** | `/api/admin/overview` | GET | Dashboard stats |
| | `/api/admin/products` | GET/POST | List/create products |
| | `/api/admin/orders` | GET | All orders |
| | `/api/admin/orders/:id/status` | PUT | Update status |

---

## Roadmap / TODO

### Testing
- [ ] Complete backend controller tests (auth, products, orders)
- [ ] Add frontend tests for LoginPage, RegisterPage, ProductPage, CartPage
- [ ] Set up E2E tests with Playwright/Cypress

### Features
- [ ] Coupon/discount system
- [ ] Product variants (size, color)
- [ ] Order tracking with shipping integration
- [ ] Email notifications for order updates

### UX/UI
- [ ] Fix accessibility issues (form labels)
- [ ] Infinite scroll option alongside pagination
- [ ] Advanced search (faceted search)
- [ ] Mobile optimizations

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide (Vercel + Render/Atlas)
- [ ] Environment variable reference

---

## License

ISC
