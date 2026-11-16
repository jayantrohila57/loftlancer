export type WebPricingPlanView = {
  readonly planId: string
  readonly tier: "free" | "paid"
  readonly quotaGib: number
  readonly aiEnabled: boolean
  readonly priceAmount: number | null
  readonly currency: string | null
  readonly interval: string | null
  readonly displayPrimary: string | null
  readonly displaySecondary: string | null
}
