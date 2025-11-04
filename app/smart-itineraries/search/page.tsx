"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./search.module.css";

type Budget = "Backpacker" | "Mid-range" | "Luxury";
type TravelType = "Solo" | "Couple" | "Family" | "Friends" | "Business";

const ALL_THEMES = [
  "Culture",
  "Nature",
  "Food",
  "Nightlife",
  "Adventure",
  "Shopping",
  "Relaxation",
  "History",
  "Art",
  "Kid Activities",
] as const;

export default function SmartItinerariesSearchPage() {
  const router = useRouter();

  // ---- Form state ----
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<number>(5);
  const [budget, setBudget] = useState<Budget>("Mid-range");
  const [kidFriendly, setKidFriendly] = useState<"Yes" | "No">("No");
  const [travelType, setTravelType] = useState<TravelType>("Solo");
  const [themes, setThemes] = useState<string[]>(["Culture", "Food"]);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activityTheme, setActivityTheme] = useState<string>("Adventure");
  const budgetToNum: Record<Budget, 1 | 2 | 3> = {
    "Backpacker": 1,
    "Mid-range": 2,
    "Luxury": 3,
  };

  // Example suggestions (swap with Places API later if you like)
  const suggestions = useMemo(
    () => [
      "Toronto, ON, Canada",
      "Waterloo, ON, Canada",
      "Ottawa, ON, Canada",
      "Montreal, QC, Canada",
      "Vancouver, BC, Canada",
      "New York, NY, USA",
      "Tokyo, Japan",
      "Paris, France",
      "Bangkok, Thailand",
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

  const toggleTheme = (label: string) => {
    setThemes((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

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
        kid_friendly: kidFriendly === "Yes" ? "true" : "false",
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
      <header className={styles.header}>
        <h1 className={styles.title}>Plan your trip</h1>
        <p className={styles.subtitle}>
          Tell us where and how you want to travel—then we’ll build your smart itinerary.
        </p>
      </header>

      {/* Back Button */}
      <div className={styles.backWrap}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.push("/")}
        >
          ← Back to Home
        </button>
      </div>

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
          <legend className={styles.label}>Budget type</legend>
          <div className={styles.pillsRow}>
            {(["Backpacker", "Mid-range", "Luxury"] as Budget[]).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={budget === b}
                className={`${styles.pill} ${budget === b ? styles.pillActive : ""
                  }`}
                onClick={() => setBudget(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Kid Friendly */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>Kid friendly</legend>
          <div className={styles.pillsRow}>
            {(["No", "Yes"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={kidFriendly === v}
                className={`${styles.pill} ${kidFriendly === v ? styles.pillActive : ""
                  }`}
                onClick={() => setKidFriendly(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Travel Type */}
        <div className={styles.field}>
          <label className={styles.label}>Travel type</label>
          <div className={styles.segment}>
            {(
              ["Solo", "Couple", "Family", "Friends", "Business"] as TravelType[]
            ).map((t) => (
              <label key={t} className={styles.segmentItem}>
                <input
                  type="radio"
                  name="travelType"
                  value={t}
                  checked={travelType === t}
                  onChange={() => setTravelType(t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Themes */}
        {/* Activity Theme (single-select) */}
        <div className={styles.field}>
          <label className={styles.label}>Activity theme</label>
          <div className={styles.segment}>
            {ALL_THEMES.map((t) => (
              <label key={t} className={styles.segmentItem}>
                <input
                  type="radio"
                  name="activityTheme"
                  value={t}
                  checked={activityTheme === t}
                  onChange={() => setActivityTheme(t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <div className={styles.hint}>Pick one focus for this trip.</div>
        </div>

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
              setBudget("Mid-range");
              setKidFriendly("No");
              setTravelType("Solo");
              setThemes(["Culture", "Food"]);
              setTouched(false);
              setActivityTheme("Adventure");
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
