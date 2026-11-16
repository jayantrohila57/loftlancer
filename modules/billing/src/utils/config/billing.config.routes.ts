export const billingRoutes = {
  overview: {
    method: "POST" as const,
    path: "/openapi/security/billing/overview" as const,
    summary: "Organization billing overview",
    description:
      "Returns cached plan, quota, credits, and provisioning status for the active organization (owner only).",
    tags: ["Billing"],
  },
  beginUpgrade: {
    method: "POST" as const,
    path: "/openapi/security/billing/begin-upgrade" as const,
    summary: "Begin Paid plan upgrade",
    description:
      "Attaches the Paid Autumn plan and returns a checkout URL when payment is required (owner only).",
    tags: ["Billing"],
  },
  openPortal: {
    method: "POST" as const,
    path: "/openapi/security/billing/open-portal" as const,
    summary: "Open billing portal",
    description: "Creates an Autumn customer portal session URL (owner only).",
    tags: ["Billing"],
  },
  listPlans: {
    method: "POST" as const,
    path: "/openapi/security/billing/list-plans" as const,
    summary: "List organization plans",
    description:
      "Returns Free and Paid catalog entries with current selection (owner only).",
    tags: ["Billing"],
  },
  beginDowngrade: {
    method: "POST" as const,
    path: "/openapi/security/billing/begin-downgrade" as const,
    summary: "Begin downgrade to Free",
    description:
      "Attaches the Free Autumn plan and removes Paid when applicable (owner only).",
    tags: ["Billing"],
  },
  listInvoices: {
    method: "POST" as const,
    path: "/openapi/security/billing/list-invoices" as const,
    summary: "List invoices",
    description:
      "Lists Autumn invoices for the organization customer (owner only).",
    tags: ["Billing"],
  },
  listPaymentHistory: {
    method: "POST" as const,
    path: "/openapi/security/billing/list-payment-history" as const,
    summary: "List payment history",
    description: "Lists paid invoices for the organization (owner only).",
    tags: ["Billing"],
  },
  customerProfile: {
    method: "POST" as const,
    path: "/openapi/security/billing/customer-profile" as const,
    summary: "Billing customer profile",
    description:
      "Returns payment method and billing address from Autumn (owner only).",
    tags: ["Billing"],
  },
  setupPayment: {
    method: "POST" as const,
    path: "/openapi/security/billing/setup-payment" as const,
    summary: "Setup payment method",
    description: "Creates a Stripe setup session URL (owner only).",
    tags: ["Billing"],
  },
  beginCancel: {
    method: "POST" as const,
    path: "/openapi/security/billing/begin-cancel" as const,
    summary: "Cancel Paid plan at period end",
    description:
      "Schedules the Paid plan to cancel at the end of the billing period (owner or admin).",
    tags: ["Billing"],
  },
} as const
