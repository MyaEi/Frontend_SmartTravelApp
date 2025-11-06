"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../smart-itineraries/search/search.module.css";

type Currency = "CAD" | "USD" | "EUR" | "THB";

export default function BudgetOptimizerSearchPage() {
  const router = useRouter();

  // ---- Form state ----
  const [origin, setOrigin] = useState("YYZ");
  const [destination, setDestination] = useState("BKK");
  const [departDate, setDepartDate] = useState("2025-12-01");
  const [returnDate, setReturnDate] = useState("2025-12-05");
  const [budget, setBudget] = useState<number>(3000);
  const [currency, setCurrency] = useState<Currency>("CAD");

  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  // suggestions like you had on the itinerary page
  const originSuggestions = useMemo(
    () => ["YYZ", "YUL", "YVR", "YOW", "JFK", "EWR", "LHR"],
    []
  );
  const destinationSuggestions = useMemo(
    () => ["BKK", "HND", "CDG", "LHR", "SIN", "DXB", "NRT"],
    []
  );

  // ---- Validation ----
  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!origin.trim()) e.origin = "Origin is required.";
    if (!destination.trim()) e.destination = "Destination is required.";

    if (!departDate) e.departDate = "Departure date is required.";
    if (!returnDate) e.returnDate = "Return date is required.";

    if (departDate && returnDate && departDate > returnDate) {
      e.returnDate = "Return date must be after departure date.";
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      e.budget = "Budget must be a positive number.";
    }

    return e;
  }, [origin, destination, departDate, returnDate, budget]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (Object.keys(errors).length > 0) return;

    setBusy(true);
    try {
      const cityCode = destination.trim().toUpperCase();

      const params = new URLSearchParams({
        origin: origin.trim().toUpperCase(),
        destination: destination.trim().toUpperCase(),
        city_code: cityCode,
        depart_date: departDate,
        return_date: returnDate,
        budget: String(budget),
        currency,
      });

      router.push(`/budget-optimization/details?${params.toString()}`);
    } finally {
      setBusy(false);
    }
  };

  const onReset = () => {
    setOrigin("YYZ");
    setDestination("BKK");
    setDepartDate("2025-12-01");
    setReturnDate("2025-12-05");
    setBudget(3000);
    setCurrency("CAD");
    setTouched(false);
  };

  return (
    <div className={styles.page}>
      {/* Back to Home – same as itinerary search */}
      <div className={styles.backWrap}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.push("/")}
        >
          ← Back to Home
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Optimize your trip budget</h1>
        <p className={styles.subtitle}>
          Tell us your route, dates, and total budget—then we’ll build
          smart packages that include flights and on-trip costs.
        </p>
      </header>

      {/* This <form> uses the same card styling as your itinerary form */}
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {/* Row 1: Origin + Destination */}
        <div className={styles.field}>
          <label htmlFor="origin" className={styles.label}>
            Origin (airport code) <span className={styles.req}>*</span>
          </label>
          <input
            id="origin"
            className={`${styles.input} ${
              touched && errors.origin ? styles.inputError : ""
            }`}
            list="origin-airports"
            placeholder="e.g., YYZ"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
          />
          <datalist id="origin-airports">
            {originSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {touched && errors.origin && (
            <div className={styles.error}>{errors.origin}</div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="destination" className={styles.label}>
            Destination (airport/city code) <span className={styles.req}>*</span>
          </label>
          <input
            id="destination"
            className={`${styles.input} ${
              touched && errors.destination ? styles.inputError : ""
            }`}
            list="destination-airports"
            placeholder="e.g., BKK"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
          />
          <datalist id="destination-airports">
            {destinationSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {touched && errors.destination && (
            <div className={styles.error}>{errors.destination}</div>
          )}
        </div>

        {/* Row 2: Dates */}
        <div className={styles.field}>
          <label htmlFor="depart" className={styles.label}>
            Departure date <span className={styles.req}>*</span>
          </label>
          <input
            id="depart"
            type="date"
            className={`${styles.input} ${
              touched && errors.departDate ? styles.inputError : ""
            }`}
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
          />
          {touched && errors.departDate && (
            <div className={styles.error}>{errors.departDate}</div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="return" className={styles.label}>
            Return date <span className={styles.req}>*</span>
          </label>
          <input
            id="return"
            type="date"
            className={`${styles.input} ${
              touched && errors.returnDate ? styles.inputError : ""
            }`}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
          {touched && errors.returnDate && (
            <div className={styles.error}>{errors.returnDate}</div>
          )}
        </div>

        {/* Row 3: Budget + Currency */}
        <div className={styles.field}>
          <label htmlFor="budget" className={styles.label}>
            Total trip budget <span className={styles.req}>*</span>
          </label>
          <input
            id="budget"
            type="number"
            min={0}
            inputMode="numeric"
            className={`${styles.inputNum} ${
              touched && errors.budget ? styles.inputError : ""
            }`}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <div className={styles.hint}>
            This budget will be split across flights, transit, meals,
            activities, and hotels (where available).
          </div>
          {touched && errors.budget && (
            <div className={styles.error}>{errors.budget}</div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="currency" className={styles.label}>
            Currency
          </label>
          <select
            id="currency"
            className={styles.input}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="THB">THB</option>
          </select>
          <div className={styles.hint}>
            All package totals and remaining budget will be shown in this
            currency.
          </div>
        </div>

        {/* Actions – same style as itinerary page */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primary}
            disabled={busy || (touched && Object.keys(errors).length > 0)}
          >
            {busy ? "Optimizing your budget…" : "See optimized packages"}
          </button>

          <button
            type="button"
            className={styles.ghost}
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </form>

      <footer className={styles.footerNote}>
        On the next page, you’ll see package options with flights, extras,
        and how much budget you have left.
      </footer>
    </div>
  );
}
