# Fest Marketplace API Documentation

## Overview
Fest Marketplace is a full-stack equipment rental platform built with Next.js, Supabase, and Stripe.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://fest-marketplace.vercel.app`

## Authentication
All protected endpoints require user authentication via Supabase.

### Login
\`\`\`bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### Sign Up
\`\`\`bash
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "renter" | "vendor"
}
\`\`\`

## Equipment Endpoints

### Get All Equipment
\`\`\`bash
GET /api/equipment
\`\`\`

Response:
\`\`\`json
[
  {
    "id": "uuid",
    "name": "Professional Microphone",
    "description": "High-quality recording microphone",
    "category": "Audio",
    "price_per_day": 150.00,
    "available": true,
    "image_url": "https://example.com/image.jpg",
    "owner_id": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
\`\`\`

### Create Equipment
\`\`\`bash
POST /api/equipment
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Professional Microphone",
  "description": "High-quality recording microphone",
  "category": "Audio",
  "price_per_day": 150.00,
  "image_url": "https://example.com/image.jpg"
}
\`\`\`

## Rental Endpoints

### Get User Rentals
\`\`\`bash
GET /api/rentals
Authorization: Bearer <token>
\`\`\`

### Create Rental
\`\`\`bash
POST /api/rentals
Content-Type: application/json
Authorization: Bearer <token>

{
  "equipment_id": "uuid",
  "owner_id": "uuid",
  "start_date": "2025-01-15",
  "end_date": "2025-01-20",
  "total_value": 750.00
}
\`\`\`

### Approve Rental
\`\`\`bash
POST /api/rentals/{id}/approve
Authorization: Bearer <token>
\`\`\`

### Reject Rental
\`\`\`bash
POST /api/rentals/{id}/reject
Authorization: Bearer <token>
\`\`\`

## Payment Endpoints

### Create Stripe Connect Account
\`\`\`bash
POST /api/stripe/connect-account
Authorization: Bearer <token>
\`\`\`

### Create Checkout Session
\`\`\`bash
POST /api/stripe/checkout
Content-Type: application/json
Authorization: Bearer <token>

{
  "rentalId": "uuid",
  "amount": 75000,
  "vendorStripeId": "acct_xxxxx"
}
\`\`\`

## Webhook Endpoints

### Stripe Webhook
\`\`\`bash
POST /api/stripe/webhook
\`\`\`

Handles:
- `checkout.session.completed` - Updates rental status to approved
- `checkout.session.expired` - Updates rental status to rejected

## Error Responses

### 401 Unauthorized
\`\`\`json
{
  "error": "Unauthorized"
}
\`\`\`

### 400 Bad Request
\`\`\`json
{
  "error": "Missing required fields"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "error": "Failed to process request"
}
\`\`\`

## Rate Limiting
- No rate limits on development
- Production: 100 requests per minute per IP

## Data Models

### User
\`\`\`typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "renter" | "vendor" | "admin";
  avatar_url?: string;
  bio?: string;
  stripe_account_id?: string;
  created_at: Date;
}
\`\`\`

### Equipment
\`\`\`typescript
interface Equipment {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category: string;
  price_per_day: number;
  available: boolean;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}
\`\`\`

### Rental
\`\`\`typescript
interface Rental {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  start_date: Date;
  end_date: Date;
  total_value: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  stripe_payment_id?: string;
  created_at: Date;
  updated_at: Date;
}
\`\`\`

## Feature Summary

### For Renters
- Browse equipment by category
- Search equipment by name
- View equipment details with images and pricing
- Create rental requests with date selection
- Process payments via Stripe
- View rental history and status
- Manage profile

### For Vendors
- List equipment with images and pricing
- View incoming rental requests
- Approve or reject rental requests
- Track rental income
- Connect Stripe account for payments
- Manage profile

### For Admins
- View all users and their roles
- View all equipment listings
- View all rentals and statuses
- Monitor platform revenue
- User and equipment management

## Development

### Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

### Environment Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
\`\`\`

### Database Migrations
Run migrations in order:
\`\`\`bash
1. scripts/001_create_schema.sql
2. scripts/002_create_profiles_trigger.sql
\`\`\`

## Deployment

### Vercel
\`\`\`bash
git push origin main
# Automatically deploys to Vercel
\`\`\`

### Environment Setup
Add environment variables in Vercel dashboard:
- Supabase credentials
- Stripe keys
- Webhook secrets
