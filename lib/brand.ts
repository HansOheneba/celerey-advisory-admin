/** Fidelity Wealth Advisor — product identity and design tokens. */

export const APPLICATION_NAME = "Fidelity Wealth Advisor";

export const APPLICATION_DESCRIPTION =
  "Fidelity Wealth Advisor helps relationship managers advise clients, review financial health, and stay aligned with long-term goals.";

export const PRODUCT_TAGLINE = "Wealth advisory workspace";

export const AUTH_SIGN_IN_TITLE = "Sign in to Fidelity";

export const AUTH_FOOTER =
  "Fidelity internal portal. For authorised advisors and wealth advisory staff.";

export const FIRM_DISPLAY_NAME = "Fidelity";

export const FIRM_CONTACT_LINE = "fidelity.com";

export const FIRM_LEGAL_LINE =
  "Fidelity Investments. Brokerage services provided by Fidelity Brokerage Services LLC.";

export const FIRM_ADDRESS = "";

export const LOGO_WORDMARK_DARK = "/fidelity/fidelity-dark.svg";

export const LOGO_WORDMARK_LIGHT = "/fidelity/fidelity-light.svg";

export const LOGO_SYMBOL = "/fidelity/fidelity-symbol.png";

export const FAVICON = "/fidelity/favicon.ico";

/**
 * Fidelity palette: four brand swatches + black only (sampled from provided assets).
 * Celerey Copilot uses separate styling — see lib/celerey-copilot.ts.
 */
export const brandColors = {
  orange: "#ff7931",
  cream: "#fff7ee",
  brown: "#906d56",
  white: "#ffffff",
  black: "#000000",
} as const;

/** Hex palette for Recharts and other canvas/SVG fills (Fidelity only). */
export const brandChartColors = [
  brandColors.orange,
  brandColors.brown,
  brandColors.black,
  brandColors.cream,
  brandColors.white,
] as const;
