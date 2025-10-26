# MyStore - Modern E-commerce Platform

A full-featured Myntra-style e-commerce web application built with Next.js 16 and Supabase, featuring product management, user authentication, shopping cart, admin panel, and banner management.

## Features

### 🛍️ Customer Features
- **Product Catalog:** Browse products by categories with search and filtering
- **User Authentication:** Sign up, login, and profile management
- **Shopping Cart:** Add/remove products, manage quantities
- **Wishlist:** Save favorite products for later
- **Product Reviews:** Rate and review purchased products
- **Responsive Design:** Mobile-first design with Tailwind CSS

### 🏪 Admin Features
- **Admin Dashboard:** Overview of sales, orders, and inventory
- **Product Management:** Add, edit, delete products with image uploads
- **Category Management:** Organize products with hierarchical categories
- **Order Management:** View and process customer orders
- **Banner Management:** Create and manage homepage promotional banners
- **User Management:** Admin role-based access control

### 🛠️ Technical Features
- **Next.js 16:** App Router with Server Components
- **Supabase:** Database, Authentication, and Storage
- **TypeScript:** Type-safe development
- **Tailwind CSS:** Modern styling with shadcn/ui components
- **Image Optimization:** Next.js Image component with Supabase Storage
- **Real-time Updates:** Live inventory and order status updates

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Lucide React
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage for images
- **Payment:** Razorpay integration
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mystore
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. **Set up the database:**
Follow the instructions in `SUPABASE_SETUP.md` to create tables, policies, and sample data.

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

See `SUPABASE_SETUP.md` for detailed instructions on:
- Creating database tables (products, categories, banners, etc.)
- Setting up Row Level Security (RLS) policies
- Configuring storage buckets for images
- Adding sample data

## Admin Panel

To access the admin panel:

1. Create an admin user account
2. In Supabase dashboard, set the user's role to 'admin' in the `users_meta` table
3. Log in and navigate to `/admin/dashboard`

Admin features include:
- `/admin/products` - Manage product catalog
- `/admin/categories` - Organize product categories
- `/admin/orders` - Process customer orders
- `/admin/banners` - Manage promotional banners
- `/admin/dashboard` - View analytics and overview

## Testing

### Admin Banners Testing
See `BANNERS_TESTING.md` for detailed testing instructions for the banner management system.

### General Testing
1. Create a customer account and browse products
2. Add items to cart and proceed to checkout
3. Test admin functionality with an admin account
4. Upload product images and banners

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/(protected)/ # Admin protected routes
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── (customer)/        # Public customer pages
├── components/            # Reusable React components
│   ├── admin/            # Admin-specific components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utility functions
    ├── supabase/         # Supabase client setup
    └── utils.ts          # Helper functions
```

## Key Components

- **AdminSidebar:** Navigation for admin panel
- **ProductCard:** Product display component
- **CartDrawer:** Shopping cart overlay
- **HeroSlider:** Homepage banner carousel
- **Navbar:** Main navigation with search

## API Endpoints

- `GET/POST /api/banners` - Banner management
- `GET/PUT/DELETE /api/banners/[id]` - Individual banner operations
- `GET/POST /api/cart` - Shopping cart operations
- `POST /api/checkout` - Payment processing

## Deployment

The app is optimized for deployment on Vercel:

```bash
npm run build
```

Set up environment variables in Vercel dashboard and deploy.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or refer to the documentation in the `docs/` directory.
