const rawGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export const gaMeasurementId = /^G-[A-Z0-9]+$/.test(rawGaId) ? rawGaId : "";
