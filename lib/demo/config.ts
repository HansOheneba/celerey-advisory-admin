/**
 * Demo mode serves the whole application from the local demo store instead of
 * the Celerey API. It is enabled only when there is no backend URL configured,
 * unless overridden with NEXT_PUBLIC_DEMO_MODE=true|false.
 */
function resolveDemoMode(): boolean {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE?.trim();

  if (flag === "true") {
    return true;
  }

  if (flag === "false") {
    return false;
  }

  return !process.env.NEXT_PUBLIC_BASE_API_URL?.trim();
}

export const DEMO_MODE = resolveDemoMode();
