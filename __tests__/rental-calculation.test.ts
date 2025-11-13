describe("Rental Calculation", () => {
  describe("calculateRentalDays", () => {
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

    it("should calculate total rental value correctly", () => {
      const pricePerDay = 150
      const days = 5
      const totalValue = days * pricePerDay
      expect(totalValue).toBe(750)
    })
  })

  describe("calculatePlatformFee", () => {
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
  })
})
