/**
 * Demo mode serves the whole application from the local demo store instead of
 * the Celerey API. Toggle with NEXT_PUBLIC_DEMO_MODE in .env / Vercel:
 *
 *   NEXT_PUBLIC_DEMO_MODE=true   → role picker login, local demo data
 *   NEXT_PUBLIC_DEMO_MODE=false  → OTP login, NEXT_PUBLIC_BASE_API_URL
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
