/**
 * Demo mode serves the whole application from the local demo store instead of
 * the Celerey API, so the portal runs end to end with no backend. Set
 * NEXT_PUBLIC_DEMO_MODE=false to point it back at NEXT_PUBLIC_BASE_API_URL.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
