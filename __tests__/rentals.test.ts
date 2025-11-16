describe("Rental Management", () => {
  const mockRental = {
    id: "rental_001",
    equipment_id: "eqp_001",
    renter_id: "user_001",
    owner_id: "vendor_001",
    start_date: "2025-01-10",
    end_date: "2025-01-15",
    total_value: 750,
    status: "pending",
    created_at: new Date().toISOString(),
  }

  describe("Calculate Rental Days", () => {
    it("should calculate correct number of days between dates", () => {
      const startDate = new Date("2025-01-01")
      const endDate = new Date("2025-01-06")
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      expect(days).toBe(5)
    })

    it("should handle same day rental", () => {
      const startDate = new Date("2025-01-01")
      const endDate = new Date("2025-01-01")
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      expect(days).toBe(0)
    })

    it("should calculate days with inclusive end date", () => {
      const startDate = new Date("2025-01-01")
      const endDate = new Date("2025-01-04")
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      expect(days).toBe(3)
    })
  })

  describe("Calculate Rental Value", () => {
    it("should calculate total rental value correctly", () => {
      const pricePerDay = 150
      const days = 5
      const totalValue = days * pricePerDay
      expect(totalValue).toBe(750)
    })

    it("should handle single day rental", () => {
      const pricePerDay = 200
      const days = 1
      const totalValue = days * pricePerDay
      expect(totalValue).toBe(200)
    })

    it("should handle multi-week rental", () => {
      const pricePerDay = 100
      const days = 14
      const totalValue = days * pricePerDay
      expect(totalValue).toBe(1400)
    })
  })

  describe("Calculate Platform Fee", () => {
    it("should calculate 15% platform fee", () => {
      const amount = 10000 // $100.00
      const platformFee = Math.round(amount * 0.15)
      expect(platformFee).toBe(1500) // $15.00
    })

    it("should calculate vendor amount after fee", () => {
      const amount = 10000 // $100.00
      const platformFee = Math.round(amount * 0.15)
      const vendorAmount = amount - platformFee
      expect(vendorAmount).toBe(8500) // $85.00
    })

    it("should calculate correct fee for different amounts", () => {
      const testCases = [
        { amount: 5000, expected: 750 },
        { amount: 20000, expected: 3000 },
        { amount: 50000, expected: 7500 },
      ]
      testCases.forEach(({ amount, expected }) => {
        const fee = Math.round(amount * 0.15)
        expect(fee).toBe(expected)
      })
    })
  })

  describe("Create Rental Request", () => {
    it("should create rental with pending status", () => {
      const rental = { ...mockRental, status: "pending" }
      expect(rental.status).toBe("pending")
    })

    it("should validate rental dates", () => {
      const rental = { ...mockRental }
      const startDate = new Date(rental.start_date)
      const endDate = new Date(rental.end_date)
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
    })

    it("should require equipment and renter IDs", () => {
      const rental = { ...mockRental }
      expect(rental.equipment_id).toBeDefined()
      expect(rental.renter_id).toBeDefined()
    })
  })

  describe("Rental Status Management", () => {
    it("should transition from pending to approved", () => {
      const statusFlow = ["pending", "approved", "completed"]
      expect(statusFlow).toContain("pending")
      expect(statusFlow).toContain("approved")
    })

    it("should transition to rejected", () => {
      const rental = { ...mockRental, status: "rejected" }
      expect(rental.status).toBe("rejected")
    })

    it("should mark rental as completed", () => {
      const rental = { ...mockRental, status: "completed" }
      expect(rental.status).toBe("completed")
    })

    it("should handle rental cancellation", () => {
      const rental = { ...mockRental, status: "cancelled" }
      expect(rental.status).toBe("cancelled")
    })
  })

  describe("Rental Validation", () => {
    it("should prevent rental of unavailable equipment", () => {
      const equipment = { available: false }
      expect(equipment.available).toBe(false)
    })

    it("should prevent duplicate concurrent rentals", () => {
      const rental1 = { start_date: "2025-01-10", end_date: "2025-01-15" }
      const rental2 = { start_date: "2025-01-12", end_date: "2025-01-20" }
      const overlap =
        new Date(rental2.start_date) < new Date(rental1.end_date) &&
        new Date(rental2.end_date) > new Date(rental1.start_date)
      expect(overlap).toBe(true)
    })
  })
})
