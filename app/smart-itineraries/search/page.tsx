"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./search.module.css";

const budgets = ["Free", "Inexpensive", "Moderate", "Expensive", "Luxury"] as const;
type Budget = typeof budgets[number];
const travelTypes = ["Solo", "Couple", "Family", "Friends"] as const;
type TravelType = typeof travelTypes[number];

const ALL_THEMES = [
  "Adventure",
  "Relaxing",
  "Culture",
  "Shopping"
] as const;

export default function SmartItinerariesSearchPage() {
  const router = useRouter();

  // ---- Form state ----
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<number>(5);
  const [budget, setBudget] = useState<Budget>(budgets[0]);
  const [travelType, setTravelType] = useState<TravelType>(travelTypes[0]);
  //const [themes, setThemes] = useState<string[]>(["Culture", "Food"]);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activityTheme, setActivityTheme] = useState<string>(ALL_THEMES[0]);
  const budgetToNum: Record<Budget, 0 | 1 | 2 | 3 | 4> = {
    "Free": 0,
    "Inexpensive": 1,
    "Moderate": 2,
    "Expensive": 3,
    "Luxury": 4
  };

  // Example suggestions 
  const suggestions = useMemo(
    () => [
      "Toronto",
      "Vancouver",
      "New York",
      "Tokyo",
      "Paris",
      "Bangkok",
    ],
    []
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!destination.trim()) e.destination = "Destination is required.";
    if (!Number.isFinite(days) || days < 1 || days > 30)
      e.days = "Choose 1–30 days.";
    return e;
  }, [destination, days]);

  // const toggleTheme = (label: string) => {
  //   setThemes((prev) =>
  //     prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
  //   );
  // };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) return;

    setBusy(true);
    try {
      const params = new URLSearchParams({
        destination: destination.trim(),
        days: String(days),
        budget: String(budgetToNum[budget]),
        travel_type: travelType.toLowerCase(),
        activity_theme: activityTheme.toLowerCase(), // single value
      });
      router.push(`/smart-itineraries/details?${params.toString()}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Back Button */}
      {/* <div className={styles.backWrap}>
        <button
          type="button"
          className={styles.backToHome}
          onClick={() => router.push("/")}
        >
          ← Back to Home
        </button>
      </div> */}

      <div className={styles.topBar}>
        <span className={styles.backLink} onClick={() => router.push("/")}>
          ← Back to Home
        </span>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Plan your trip</h1>
        <p className={styles.subtitle}>
          Tell us where and how you want to travel—then we’ll build your smart itinerary.
        </p>
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {/* Destination */}
        <div className={styles.field}>
          <label htmlFor="dest" className={styles.label}>
            Destination <span className={styles.req}>*</span>
          </label>
          <input
            id="dest"
            className={`${styles.input} ${touched && errors.destination ? styles.inputError : ""
              }`}
            list="destinations"
            placeholder="e.g., Waterloo"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <datalist id="destinations">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {touched && errors.destination ? (
            <div className={styles.error}>{errors.destination}</div>
          ) : null}
        </div>

        {/* Days */}
        <div className={styles.field}>
          <label htmlFor="days" className={styles.label}>
            How many days? <span className={styles.req}>*</span>
          </label>
          <input
            id="days"
            type="number"
            min={1}
            max={30}
            inputMode="numeric"
            className={`${styles.inputNum} ${touched && errors.days ? styles.inputError : ""
              }`}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
          <div className={styles.hint}>Range: 1–30</div>
          {touched && errors.days ? (
            <div className={styles.error}>{errors.days}</div>
          ) : null}
        </div>

        {/* Budget */}
        <fieldset className={styles.fieldset}>
          <label className={styles.label}>Budget Type</label>
          <div className={styles.pillsRow}>
            {budgets.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={budget === b}
                className={`${styles.pill} ${budget === b ? styles.pillActive : ""}`}
                onClick={() => setBudget(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Travel Type */}
        <fieldset className={styles.fieldset}>
          <label className={styles.label}>Travel Type</label>
          <div className={styles.pillsRow}>
            {travelTypes.map((t) => (
              // <label key={t} className={styles.segmentItem}>
              //   <input
              //     type="radio"
              //     name="travelType"
              //     value={t}
              //     checked={travelType === t}
              //     onChange={() => setTravelType(t)}
              //   />
              //   <span>{t}</span>
              // </label>
              <button
                key={t}
                type="button"
                aria-pressed={travelType === t}
                className={`${styles.pill} ${travelType === t ? styles.pillActive : ""}`}
                onClick={() => setTravelType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Activity Themes */}
        {/* Activity Theme (single-select) */}
        <fieldset className={styles.fieldset}>
          <label className={styles.label}>Activity Theme</label>
          <div className={styles.pillsRow}>
            {ALL_THEMES.map((t) => (
              // <label key={t} className={styles.segmentItem}>
              //   <input
              //     type="radio"
              //     name="activityTheme"
              //     value={t}
              //     checked={activityTheme === t}
              //     onChange={() => setActivityTheme(t)}
              //   />
              //   <span>{t}</span>
              // </label>
              <button
                key={t}
                type="button"
                aria-pressed={activityTheme === t}
                className={`${styles.pill} ${activityTheme === t ? styles.pillActive : ""}`}
                onClick={() => setActivityTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={styles.hint}>Pick one focus for this trip.</div>
        </fieldset>

        {/* <div className={styles.field}>
          <label className={styles.label}>Activity theme</label>
          <div className={styles.checkboxGrid}>
            {ALL_THEMES.map((label) => (
              <label key={label} className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={themes.includes(label)}
                  onChange={() => toggleTheme(label)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className={styles.hint}>
            Pick a few—this helps balance your days.
          </div>
        </div> */}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primary}
            disabled={busy || Object.keys(errors).length > 0 && touched}
          >
            {busy ? "Building options…" : "See itinerary"}
          </button>

          <button
            type="button"
            className={styles.ghost}
            onClick={() => {
              setDestination("");
              setDays(5);
              setBudget(budgets[0]);
              setTravelType(travelTypes[0]);
              setTouched(false);
              setActivityTheme(ALL_THEMES[0]);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <footer className={styles.footerNote}>
        You’ll be able to fine-tune filters (rating, attractions vs restaurants,
        per-day view) on the next page.
      </footer>
    </div>
  );
}
