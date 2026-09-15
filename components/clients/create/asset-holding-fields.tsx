"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import {
  useIsSymbolClaimedElsewhere,
  useSymbolClaimActions,
} from "@/components/clients/create/holding-symbol-registry";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_TYPES } from "@/lib/clients/creation-options";
import {
  type AssetType,
  type ValuationMethod,
  deriveValuationMethod,
  findSymbolOption,
  hasLiveCryptoPrice,
  isMarketAssetType,
  supportsSymbol,
  symbolsForType,
  valuationMethodLabel,
} from "@/lib/clients/asset-holdings";
import { cn } from "@/lib/utils";

type AssetHoldingFieldsProps = {
  nameFor: (key: string) => string;
  idFor: (key: string) => string;
  defaultAssetType?: AssetType;
  initialValueDate?: string;
};

type HoldingDraft = {
  assetType: AssetType;
  symbol: string;
  name: string;
  /** Lets a type switch clear an auto-filled name without wiping a typed one. */
  nameFromSymbol: boolean;
  quantity: string;
  amountInvested: string;
  currentValue: string;
  faceValue: string;
  couponRate: string;
  maturityDate: string;
};

const VALUATION_STYLES: Record<ValuationMethod, string> = {
  market: "border-sky-500/20 bg-sky-500/10 text-sky-700",
  auto_calculated: "border-violet-500/20 bg-violet-500/10 text-violet-700",
  manual: "border-amber-500/20 bg-amber-500/10 text-warning",
};

const VALUATION_HINTS: Record<ValuationMethod, string> = {
  market:
    "Priced from a feed. Send a current value too — only mapped crypto has a live feed.",
  auto_calculated:
    "The backend accrues this over time. Seed a current value so day one isn't stuck at par.",
  manual: "Valuation comes from what you enter here. Goes stale after 30 days.",
};

export function AssetHoldingFields({
  nameFor,
  idFor,
  defaultAssetType = "stock",
  initialValueDate,
}: AssetHoldingFieldsProps) {
  const rowId = useId();
  const { claim, release } = useSymbolClaimActions();
  const symbolInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<HoldingDraft>({
    assetType: defaultAssetType,
    symbol: "",
    name: "",
    nameFromSymbol: false,
    quantity: "",
    amountInvested: "",
    currentValue: "",
    faceValue: "",
    couponRate: "",
    maturityDate: "",
  });
  const [symbolSearch, setSymbolSearch] = useState("");

  const {
    assetType,
    symbol,
    name,
    quantity,
    amountInvested,
    currentValue,
    faceValue,
    couponRate,
    maturityDate,
  } = draft;

  const isMarket = isMarketAssetType(assetType);
  const isBond = assetType === "bond";
  const isCash = assetType === "cash";
  const isMutualFund = assetType === "mutual_fund";
  const isManualOnly = assetType === "alternative" || assetType === "other";
  const showSymbolPicker = supportsSymbol(assetType);

  const parsedCouponRate = Number.parseFloat(couponRate);
  const valuationMethod = deriveValuationMethod(
    assetType,
    symbol,
    Number.isFinite(parsedCouponRate) ? parsedCouponRate : null,
  );

  const catalog = symbolsForType(assetType);
  const matchedOption = findSymbolOption(assetType, symbol);
  const isDuplicate = useIsSymbolClaimedElsewhere(rowId, symbol.trim().toUpperCase());

  const filteredSymbols = useMemo(() => {
    const query = symbolSearch.trim().toLowerCase();
    if (!query) {
      return catalog;
    }
    return catalog.filter(
      (option) =>
        option.symbol.toLowerCase().includes(query) ||
        option.name.toLowerCase().includes(query),
    );
  }, [catalog, symbolSearch]);

  useEffect(() => {
    claim(rowId, symbol.trim().toUpperCase());
  }, [claim, rowId, symbol]);

  useEffect(() => () => release(rowId), [release, rowId]);

  useEffect(() => {
    symbolInputRef.current?.setCustomValidity(
      isDuplicate ? "This symbol is already on another holding." : "",
    );
  }, [isDuplicate]);

  function changeAssetType(next: AssetType) {
    setDraft((current) => {
      const keepsSymbol =
        supportsSymbol(next) && Boolean(findSymbolOption(next, current.symbol));

      return {
        ...current,
        assetType: next,
        symbol: keepsSymbol ? current.symbol : "",
        // An auto-filled name belongs to the old symbol, so drop it with the symbol.
        name: keepsSymbol || !current.nameFromSymbol ? current.name : "",
        nameFromSymbol: keepsSymbol ? current.nameFromSymbol : false,
        quantity: isMarketAssetType(next) ? current.quantity : "",
        faceValue: next === "bond" ? current.faceValue : "",
        maturityDate: next === "bond" ? current.maturityDate : "",
        couponRate: next === "bond" || next === "cash" ? current.couponRate : "",
      };
    });
    setSymbolSearch("");
  }

  function selectSymbol(nextSymbol: string) {
    const option = findSymbolOption(assetType, nextSymbol);
    setDraft((current) => ({
      ...current,
      symbol: nextSymbol,
      name: option && (!current.name || current.nameFromSymbol) ? option.name : current.name,
      nameFromSymbol: Boolean(option) && (!current.name || current.nameFromSymbol),
    }));
    setSymbolSearch("");
  }

  function typeSymbol(rawValue: string) {
    const nextSymbol = rawValue.toUpperCase();
    const option = findSymbolOption(assetType, nextSymbol);
    setDraft((current) => ({
      ...current,
      symbol: nextSymbol,
      name: option && (!current.name || current.nameFromSymbol) ? option.name : current.name,
      nameFromSymbol: option ? !current.name || current.nameFromSymbol : current.nameFromSymbol,
    }));
  }

  function setField<K extends keyof HoldingDraft>(key: K, value: HoldingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  /** cost_basis per the contract: bond = face/par, cash = balance, else invested. */
  const derivedCostBasis = isBond
    ? faceValue
    : isCash
      ? currentValue
      : amountInvested || currentValue;

  const investedLabel = isBond ? "Amount paid" : "Amount invested";
  const showLiveBadge = hasLiveCryptoPrice(assetType, symbol);
  const unmappedCrypto = assetType === "crypto" && symbol.trim() !== "" && !showLiveBadge;

  return (
    <div className="space-y-5">
      <input type="hidden" name={nameFor("asset_type")} value={assetType} />
      <input type="hidden" name={nameFor("valuation_method")} value={valuationMethod} />
      <input type="hidden" name={nameFor("cost_basis")} value={derivedCostBasis} />
      {valuationMethod === "manual" ? (
        <input
          type="hidden"
          name={nameFor("last_updated")}
          value={new Date().toISOString()}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={idFor("asset_type")}>Asset type</Label>
          <Select
            value={assetType}
            onValueChange={(next) => changeAssetType((next ?? defaultAssetType) as AssetType)}
          >
            <SelectTrigger id={idFor("asset_type")} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-medium">Valuation</span>
          <div className="flex h-9 items-center gap-2">
            <Badge variant="outline" className={VALUATION_STYLES[valuationMethod]}>
              {valuationMethodLabel(valuationMethod)}
            </Badge>
            {showLiveBadge ? (
              <Badge variant="outline" className="border-border bg-surface-success text-success">
                Live price
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {VALUATION_HINTS[valuationMethod]}
          </p>
        </div>
      </div>

      {showSymbolPicker ? (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor={idFor("symbol")}>
              Symbol{isMutualFund ? " (optional)" : ""}
            </Label>
            {matchedOption ? (
              <span className="truncate text-xs text-muted-foreground">
                {matchedOption.name}
              </span>
            ) : null}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={symbolSearch}
              onChange={(event) => setSymbolSearch(event.target.value)}
              placeholder={`Search ${catalog.length} ${assetType.replace("_", " ")} tickers…`}
              className="pl-9"
            />
          </div>

          <div className="max-h-44 overflow-y-auto rounded-lg border border-border/60 bg-background/60 p-2">
            {filteredSymbols.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No match in the supported list. Type an unlisted ticker below — it saves,
                but never gets a live price.
              </p>
            ) : (
              <div className="grid gap-1 sm:grid-cols-2">
                {filteredSymbols.map((option) => {
                  const isSelected = symbol === option.symbol;
                  return (
                    <button
                      key={option.symbol}
                      type="button"
                      onClick={() => selectSymbol(option.symbol)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 ring-1 ring-primary/30"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <Badge variant="secondary" className="shrink-0 font-mono">
                        {option.symbol}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Input
            ref={symbolInputRef}
            id={idFor("symbol")}
            name={nameFor("symbol")}
            value={symbol}
            onChange={(event) => typeSymbol(event.target.value)}
            placeholder={isMarket ? "Selected ticker" : "Leave empty for manual valuation"}
            required={isMarket}
            aria-invalid={isDuplicate}
            className="font-mono"
          />

          {isDuplicate ? (
            <p className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-warning">
              <AlertTriangle className="size-3.5 shrink-0" />
              {symbol} is already on another holding. The client dashboard blocks duplicate
              active positions.
            </p>
          ) : null}

          {unmappedCrypto ? (
            <p className="text-xs text-muted-foreground">
              {symbol} isn&apos;t in the CoinGecko map — it saves without a live price, so
              enter a current value.
            </p>
          ) : null}

          {isMutualFund ? (
            <p className="text-xs text-muted-foreground">
              With a ticker this is treated as market priced. Leave it empty for a local
              unit trust and enter the value manually.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={idFor("name")}>Name</Label>
        <Input
          id={idFor("name")}
          name={nameFor("name")}
          value={name}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              name: event.target.value,
              nameFromSymbol: false,
            }))
          }
          placeholder={
            isBond
              ? "US Treasury 10yr"
              : isCash
                ? "High-yield savings"
                : isManualOnly
                  ? "Private equity fund"
                  : "Auto-filled from the symbol"
          }
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isMarket ? (
          <div className="space-y-2">
            <Label htmlFor={idFor("quantity")}>Units held</Label>
            <Input
              id={idFor("quantity")}
              name={nameFor("quantity")}
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(event) => setField("quantity", event.target.value)}
              placeholder="40"
              required
            />
            <p className="text-xs text-muted-foreground">
              Shares, coins, or units in the account.
            </p>
          </div>
        ) : null}

        {isBond ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={idFor("face_value")}>Face / par value</Label>
              {/* Unnamed: submitted as cost_basis through the hidden field above. */}
              <Input
                id={idFor("face_value")}
                type="number"
                min={0}
                step="0.01"
                value={faceValue}
                onChange={(event) => setField("faceValue", event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Principal repaid at maturity. Stored as cost basis.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={idFor("maturity_date")}>Maturity date</Label>
              <Input
                id={idFor("maturity_date")}
                name={nameFor("maturity_date")}
                type="date"
                value={maturityDate}
                onChange={(event) => setField("maturityDate", event.target.value)}
                required
              />
            </div>
          </>
        ) : null}

        {isBond || isCash ? (
          <div className="space-y-2">
            <Label htmlFor={idFor("coupon_rate")}>
              {isBond ? "Coupon rate (%)" : "Interest rate / APY (%)"}
            </Label>
            <Input
              id={idFor("coupon_rate")}
              name={nameFor("coupon_rate")}
              type="number"
              min={0}
              step="0.01"
              value={couponRate}
              onChange={(event) => setField("couponRate", event.target.value)}
              required={isBond}
            />
            {isCash ? (
              <p className="text-xs text-muted-foreground">
                Optional. Setting a rate switches this to auto-calculated.
              </p>
            ) : null}
          </div>
        ) : null}

        {!isCash ? (
          <div className="space-y-2">
            <Label htmlFor={idFor("amount_invested")}>{investedLabel}</Label>
            <Input
              id={idFor("amount_invested")}
              name={nameFor("amount_invested")}
              type="number"
              min={0}
              step="0.01"
              value={amountInvested}
              onChange={(event) => setField("amountInvested", event.target.value)}
              required={isMarket}
            />
            <p className="text-xs text-muted-foreground">
              {isBond
                ? "What was actually paid — bonds trade above or below par."
                : "Total paid across all units. This is the cost basis."}
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={idFor("current_value")}>
            {isCash ? "Balance today" : "Current value"}
          </Label>
          <Input
            id={idFor("current_value")}
            name={nameFor("current_value")}
            type="number"
            min={0}
            step="0.01"
            value={currentValue}
            onChange={(event) => setField("currentValue", event.target.value)}
            required={isCash || isManualOnly}
          />
          <p className="text-xs text-muted-foreground">
            {isCash
              ? "The account balance as of today."
              : showLiveBadge
                ? "Optional fallback for when the live feed is cold."
                : "Without this the dashboard shows cost basis and hides gain/loss."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={idFor("initial_value_date")}>
            {isCash ? "As-of date" : "Purchase date"}
          </Label>
          <Input
            id={idFor("initial_value_date")}
            name={nameFor("initial_value_date")}
            type="date"
            defaultValue={initialValueDate}
            required
          />
        </div>
      </div>
    </div>
  );
}
