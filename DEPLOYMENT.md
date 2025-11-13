# Fest Marketplace Deployment Guide

## Prerequisites
- GitHub account
- Vercel account
- Supabase project
- Stripe account with Connect enabled

## Step 1: Prepare GitHub Repository

1. Push code to GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial commit: Fest Marketplace"
git branch -M main
git remote add origin https://github.com/yourusername/fest-marketplace.git
git push -u origin main
\`\`\`

## Step 2: Setup Supabase

1. Create a new project on supabase.com
2. Note your Project URL and Anon Key
3. Run SQL migrations:
   - Go to SQL Editor
   - Copy content from `scripts/001_create_schema.sql`
   - Execute
   - Copy content from `scripts/002_create_profiles_trigger.sql`
   - Execute

## Step 3: Configure Stripe

1. Go to stripe.com and create an account
2. Enable Stripe Connect (get approved)
3. Get your keys from API dashboard:
   - Publishable Key (starts with pk_)
   - Secret Key (starts with sk_)
4. Setup webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: checkout.session.completed, checkout.session.expired
   - Copy Webhook Signing Secret

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to vercel.com/new
2. Select "Import Git Repository"
3. Connect your GitHub repository
4. Configure project:
   - Framework: Next.js
   - Root Directory: ./
5. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY
   - STRIPE_WEBHOOK_SECRET
6. Click "Deploy"
7. Wait for deployment to complete

### Option B: Via Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET

# Deploy to production
vercel --prod
\`\`\`

## Step 5: Configure Production Settings

### Supabase
1. In Supabase dashboard, go to Auth > URL Configuration
2. Add your Vercel domain to "Redirect URLs":
   - https://yourdomain.vercel.app/auth/callback
   - https://yourdomain.vercel.app

### Stripe
1. Update webhook endpoint in Stripe dashboard:
   - New URL: https://yourdomain.vercel.app/api/stripe/webhook

2. Update redirect URLs:
   - Success: https://yourdomain.vercel.app/checkout/success
   - Cancel: https://yourdomain.vercel.app/checkout/cancel

### Database
1. In Supabase, configure RLS policies
2. Enable Row Level Security on all tables
3. Test policies with sample data

## Step 6: Testing Production

1. Create test account with Stripe test card: 4242 4242 4242 4242
2. Test complete user flow:
   - Sign up as renter
   - Browse equipment
   - Create rental request
   - Process payment
   - Verify in admin panel

3. Test vendor flow:
   - Sign up as vendor
   - Add equipment
   - Connect Stripe account
   - Receive payment for rental

## Monitoring & Maintenance

### Logs
\`\`\`bash
# View Vercel logs
vercel logs [deployment-url]
\`\`\`

### Database Backups
- Supabase provides automatic daily backups
- Manual backups available in Supabase dashboard

### Performance Monitoring
- Use Vercel Analytics to monitor site performance
- Check error rates in Vercel dashboard

### Security Checklist
- [ ] Enable 2FA on all accounts (GitHub, Vercel, Supabase, Stripe)
- [ ] Rotate API keys quarterly
- [ ] Review webhook logs regularly
- [ ] Monitor failed payments
- [ ] Check for suspicious user activity

## Troubleshooting

### 500 Error on API Routes
1. Check environment variables in Vercel dashboard
2. Verify Supabase connection strings
3. Check Stripe API keys
4. Review logs: `vercel logs [url]`

### Stripe Webhook Not Working
1. Verify webhook URL is correct
2. Check webhook signing secret
3. Review Stripe logs for failed events
4. Re-trigger events from Stripe dashboard

### Database Connection Issues
1. Check Supabase project status
2. Verify connection string
3. Check Row Level Security policies
4. Ensure user is authenticated

### Auth Issues
1. Verify redirect URLs are correct
2. Check Supabase auth configuration
3. Clear browser cookies and retry
4. Check email verification status

## Scaling Considerations

### Database
- Monitor row count in each table
- Consider indexing on frequently queried columns
- Archive old rentals periodically
- Use connection pooling for API routes

### Storage
- Implement image optimization
- Use CDN for static assets
- Set up automated cleanup for old images

### API Rate Limiting
- Implement rate limiting on endpoints
- Monitor API usage in Vercel Analytics
- Consider caching for frequently accessed data

## Cost Optimization

### Supabase
- Use optimized queries to reduce database reads
- Archive old data to reduce storage costs
- Consider reserved connections

### Vercel
- Use automatic deployments (only on main branch)
- Monitor function execution time
- Use edge functions for simple logic

### Stripe
- Standard processing fees apply
- Connect payout fees: 0.25% + $0.25
- Monitor dispute rates

---

For support, contact your deployment provider or refer to their documentation.
\`\`\`
