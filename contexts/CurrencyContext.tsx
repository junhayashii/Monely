"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "USD" | "JPY" | "BRL";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (value: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_CONFIG: Record<Currency, { symbol: string; code: string }> = {
  USD: { symbol: "$", code: "USD" },
  JPY: { symbol: "¥", code: "JPY" },
  BRL: { symbol: "R$", code: "BRL" },
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("BRL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load currency from localStorage
    const savedCurrency = localStorage.getItem("currency") as Currency;
    if (savedCurrency && (savedCurrency === "USD" || savedCurrency === "JPY" || savedCurrency === "BRL")) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem("currency", newCurrency);
      // Trigger a custom event to notify all components
      window.dispatchEvent(new CustomEvent("currencyChanged", { detail: newCurrency }));
    }
  };

  const formatCurrency = (value: number): string => {
    const config = CURRENCY_CONFIG[currency];
    if (currency === "JPY") {
      // Japanese Yen typically doesn't use decimals
      return `${config.symbol}${Math.round(value).toLocaleString()}`;
    }
    return `${config.symbol} ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCurrencySymbol = (): string => {
    return CURRENCY_CONFIG[currency].symbol;
  };

  // Always provide the context, even before mounted, to prevent errors
  // The currency will be updated from localStorage once mounted
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
