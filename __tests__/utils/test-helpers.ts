/**
 * Test Helper Functions
 * Utilities para facilitar testes e mocks comuns
 */

// Mock de data para testes
export const mockDates = {
  today: new Date("2025-01-15"),
  tomorrow: new Date("2025-01-16"),
  nextWeek: new Date("2025-01-22"),
  nextMonth: new Date("2025-02-15"),
}

// Mock de usuários
export const mockUsers = {
  renter: {
    id: "user_renter_001",
    name: "João Silva",
    email: "joao@example.com",
    role: "renter",
    created_at: mockDates.today.toISOString(),
  },
  vendor: {
    id: "vendor_001",
    name: "Maria Equipamentos",
    email: "maria@example.com",
    role: "vendor",
    created_at: mockDates.today.toISOString(),
  },
  admin: {
    id: "admin_001",
    name: "Admin System",
    email: "admin@example.com",
    role: "admin",
    created_at: mockDates.today.toISOString(),
  },
}

// Mock de equipamentos
export const mockEquipment = {
  speaker: {
    id: "eqp_001",
    name: "JBL Professional Speaker",
    description: "High-quality portable speaker",
    category: "Audio",
    price_per_day: 150,
    image_url: "https://example.com/speaker.jpg",
    owner_id: mockUsers.vendor.id,
    available: true,
  },
  projector: {
    id: "eqp_002",
    name: "Epson Projector",
    description: "HD projection for events",
    category: "Visual",
    price_per_day: 200,
    image_url: "https://example.com/projector.jpg",
    owner_id: mockUsers.vendor.id,
    available: true,
  },
}

// Mock de locações
export const createMockRental = (overrides = {}) => ({
  id: "rental_001",
  equipment_id: mockEquipment.speaker.id,
  renter_id: mockUsers.renter.id,
  owner_id: mockUsers.vendor.id,
  start_date: mockDates.tomorrow.toISOString(),
  end_date: mockDates.nextWeek.toISOString(),
  total_value: 1050, // 7 days * 150
  status: "pending",
  created_at: mockDates.today.toISOString(),
  ...overrides,
})

// Funções de cálculo para testes
export const rentalCalculations = {
  calculateDays: (startDate: Date, endDate: Date): number => {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  },

  calculateTotal: (daysCount: number, pricePerDay: number): number => {
    return daysCount * pricePerDay
  },

  calculatePlatformFee: (amount: number): number => {
    return Math.round(amount * 0.15)
  },

  calculateVendorPayout: (amount: number): number => {
    const fee = Math.round(amount * 0.15)
    return amount - fee
  },
}

// Validadores para testes
export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidRole: (role: string): boolean => {
    return ["renter", "vendor", "admin"].includes(role)
  },

  isValidPrice: (price: number): boolean => {
    return price >= 10 && price <= 5000
  },

  isValidCategory: (category: string): boolean => {
    const validCategories = ["Audio", "Lighting", "Video", "Furniture", "Decoration"]
    return validCategories.includes(category)
  },
}
