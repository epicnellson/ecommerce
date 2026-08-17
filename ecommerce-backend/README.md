# Ecommerce Backend

A Node.js/Express REST API for a full-featured ecommerce platform.

## Features

- **Authentication**: JWT-based auth with register, login, and profile management
- **Products**: Full CRUD with search, filter, pagination, and reviews
- **Cart**: Database-synced shopping cart with stock validation
- **Orders**: Order creation, management, cancellation, and refund processing
- **Wishlist**: User wishlist functionality
- **Admin Dashboard**: Product management and order oversight
- **Email Notifications**: Order confirmation and status updates via SMTP
- **Image Upload**: Product image upload via Cloudinary

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- Stripe for payments
- Nodemailer for emails
- Cloudinary for image uploads
- Jest + Supertest for testing

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Cloudinary account (for image uploads)
- SMTP provider (Gmail, SendGrid, etc.)

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_jwt_secret

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional - emails will be logged if not configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (optional - uploads will fail if not configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

```bash
npm install
```

## Development Scripts

```bash
# Start development server (with nodemon)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Seed products database
npm run seed:products
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get products (with search, filter, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/refund` - Refund order (admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Sync cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/item` - Update item quantity
- `DELETE /api/cart/item/:id` - Remove item from cart

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Uploads
- `POST /api/upload/image` - Upload product image (admin)

## Testing

The backend uses Jest + Supertest for API testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=authApi
```

Tests require a MongoDB connection. Set `MONGODB_TEST_URI` in your environment or ensure MongoDB is running locally.

## License

ISC
