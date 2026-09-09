"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type SymbolClaims = Record<string, string>;

type SymbolActions = {
  claim: (rowId: string, symbol: string) => void;
  release: (rowId: string) => void;
};

const NO_CLAIMS: SymbolClaims = {};
const NO_ACTIONS: SymbolActions = { claim: () => {}, release: () => {} };

const ClaimsContext = createContext<SymbolClaims>(NO_CLAIMS);
/** Kept separate from claims so the actions identity stays stable across updates. */
const ActionsContext = createContext<SymbolActions>(NO_ACTIONS);

/**
 * Tracks which ticker each holding row has selected so the same symbol can't be
 * added twice — the client dashboard rejects duplicate active holdings.
 */
export function HoldingSymbolRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [claims, setClaims] = useState<SymbolClaims>({});

  const claim = useCallback((rowId: string, symbol: string) => {
    setClaims((current) =>
      current[rowId] === symbol ? current : { ...current, [rowId]: symbol },
    );
  }, []);

  const release = useCallback((rowId: string) => {
    setClaims((current) => {
      if (!(rowId in current)) {
        return current;
      }
      const next = { ...current };
      delete next[rowId];
      return next;
    });
  }, []);

  const actions = useMemo(() => ({ claim, release }), [claim, release]);

  return (
    <ActionsContext.Provider value={actions}>
      <ClaimsContext.Provider value={claims}>{children}</ClaimsContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useSymbolClaimActions(): SymbolActions {
  return useContext(ActionsContext);
}

export function useIsSymbolClaimedElsewhere(rowId: string, symbol: string): boolean {
  const claims = useContext(ClaimsContext);

  if (!symbol) {
    return false;
  }

  return Object.entries(claims).some(
    ([claimRowId, claimed]) => claimRowId !== rowId && claimed === symbol,
  );
}
