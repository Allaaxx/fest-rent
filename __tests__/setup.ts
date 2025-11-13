import dotenv from "dotenv"

// Load environment variables from .env.test
dotenv.config({ path: ".env.test" })

// Mock Supabase
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
  })),
  createBrowserClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(),
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}))

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "sess_test_123",
          url: "https://checkout.stripe.com/test",
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "sess_test_123",
          payment_status: "paid",
          metadata: { rentalId: "rental_123" },
        }),
      },
    },
    accounts: {
      create: jest.fn().mockResolvedValue({
        id: "acct_test_123",
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: "acct_test_123",
        charges_enabled: true,
      }),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }))
})
