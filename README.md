# Fest Marketplace

A modern marketplace for renting event equipment for corporate and casual occasions. Built with Next.js, Supabase, Tailwind CSS, and Stripe.

## Features

### For Renters
- Browse thousands of equipment listings
- Filter by category and price
- View detailed product information
- Book equipment with flexible dates
- Secure Stripe payments
- Rental history tracking

### For Vendors
- List equipment easily with images and pricing
- Receive rental requests
- Approve or reject bookings
- Earn money from equipment rentals
- Stripe Connect for automatic payouts
- Dashboard for income tracking

### For Admins
- Manage users and roles
- Monitor all listings and rentals
- View platform analytics and revenue
- Support user and equipment management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe & Stripe Connect
- **Testing**: Jest
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/fest-marketplace.git
cd fest-marketplace
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Setup environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
\`\`\`

4. Setup database
\`\`\`bash
# Run migrations in Supabase SQL editor
1. scripts/001_create_schema.sql
2. scripts/002_create_profiles_trigger.sql
\`\`\`

5. Run development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to start.

## Usage

### As a Renter
1. Sign up or login
2. Browse equipment listings
3. Click on an item to view details
4. Select rental dates
5. Process payment via Stripe
6. View your rentals in the dashboard

### As a Vendor
1. Sign up as a vendor
2. Connect your Stripe account
3. Add equipment listings
4. Receive and manage rental requests
5. View your earnings and payouts

### As an Admin
1. Login with admin account
2. Access admin dashboard at `/admin`
3. View all users, equipment, and rentals
4. Monitor platform analytics

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

### Key Endpoints
- `GET /api/equipment` - List all equipment
- `POST /api/equipment` - Create new equipment
- `GET /api/rentals` - Get user rentals
- `POST /api/rentals` - Create rental request
- `POST /api/rentals/{id}/approve` - Approve rental
- `POST /api/rentals/{id}/reject` - Reject rental
- `POST /api/stripe/checkout` - Create payment session
- `POST /api/stripe/webhook` - Handle Stripe events

## Testing

Run tests with Jest:
\`\`\`bash
npm test
\`\`\`

Tests include:
- Rental calculation logic
- Authentication flows
- Equipment CRUD operations
- Payment processing
- User role validation

## Database Schema

### Users
- id (UUID, PK)
- email (String, Unique)
- name (String)
- role (Enum: renter, vendor, admin)
- stripe_account_id (String, Optional)

### Equipment
- id (UUID, PK)
- owner_id (UUID, FK -> Users)
- name (String)
- description (Text)
- category (String)
- price_per_day (Decimal)
- available (Boolean)
- image_url (String)

### Rentals
- id (UUID, PK)
- equipment_id (UUID, FK -> Equipment)
- renter_id (UUID, FK -> Users)
- owner_id (UUID, FK -> Users)
- start_date (Date)
- end_date (Date)
- total_value (Decimal)
- status (Enum: pending, approved, rejected, completed)
- stripe_payment_id (String)

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for protected routes
- Stripe payments processed securely
- User data encrypted in database
- CORS protection on API endpoints
- Input validation on all forms

## Deployment

### Deploy to Vercel

1. Push code to GitHub
\`\`\`bash
git add .
git commit -m "Deploy Fest Marketplace"
git push origin main
\`\`\`

2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
STRIPE_SECRET_KEY=live_secret_key
STRIPE_PUBLISHABLE_KEY=live_publishable_key
STRIPE_WEBHOOK_SECRET=webhook_secret
\`\`\`

## Future Enhancements

- User reviews and ratings
- Messaging system between renters and vendors
- Advanced analytics dashboard
- Mobile app
- Email notifications
- Real-time availability calendar
- Insurance integration
- Damage protection plans

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@festmarketplace.com or open an issue on GitHub.

## Team

Built with Next.js and modern web technologies.

---

**Fest Marketplace** - Making event equipment rental simple and secure.
