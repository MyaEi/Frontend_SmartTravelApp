"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./budget.module.css";

type BudgetPackage = {
  flight: {
    id: string;
    price: number;
    currency: string;
  } | null;
  hotel: {
    id?: string;
    name?: string;
    price?: number;
    currency?: string;
    nights?: number;
  } | null;
  transit: {
    total: number;
  } | null;
  activities: number;
  meals: number;
  currency: string;
  total: number;
  fxSnapshot: {
    base: string;
    ts: string;
  };
  status: string;
  budgetRemaining: number;
};

type BudgetOptimizeResponse = {
  success: boolean;
  packages: BudgetPackage[];
  total_packages: number;
  message: string;
  progress: string[];
  stats: {
    flights_found: number;
    hotels_found: number;
    packages_within_budget: number;
  };
};

export default function BudgetOptimizerDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [data, setData] = useState<BudgetOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const budget = params.get("budget") ?? "";
  const currency = params.get("currency") ?? "CAD";
  const origin = params.get("origin") ?? "";
  const destination = params.get("destination") ?? "";
  const city_code = params.get("city_code") ?? destination;
  const depart_date = params.get("depart_date") ?? "";
  const return_date = params.get("return_date") ?? "";

  const inputSummary = useMemo(
    () => ({
      origin,
      destination,
      budget,
      currency,
      depart_date,
      return_date,
      city_code,
    }),
    [origin, destination, budget, currency, depart_date, return_date, city_code]
  );

  useEffect(() => {
    if (!budget || !origin || !destination || !depart_date || !return_date) {
      setErr("Missing required search parameters.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget: Number(budget),
        city_code,
        currency,
        depart_date,
        destination,
        origin,
        return_date,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
        return r.json();
      })
      .then((json: BudgetOptimizeResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => !cancelled && setErr(e.message || "Failed to optimize trip"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [budget, city_code, currency, depart_date, destination, origin, return_date]);

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
          >
            ← Back
          </button>
          <h1 className={styles.title}>Optimizing your budget…</h1>
          <p className={styles.subtitle}>
            We’re fetching flights and calculating extras for this trip.
          </p>
        </header>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
          >
            ← Back
          </button>
          <h1 className={styles.title}>We couldn’t optimize this trip</h1>
          <p className={styles.subtitle}>{err ?? "Unknown error"}</p>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <h1 className={styles.title}>Budget optimization results</h1>
        <p className={styles.subtitle}>
          {inputSummary.origin} → {inputSummary.destination} ·{" "}
          {inputSummary.depart_date} – {inputSummary.return_date}
        </p>

        <div className={styles.summaryRow}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total budget</span>
            <span className={styles.summaryValue}>
              {Number(inputSummary.budget).toFixed(2)} {inputSummary.currency}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Packages found</span>
            <span className={styles.summaryValue}>
              {data.total_packages} total
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Within budget</span>
            <span className={styles.summaryValue}>
              {data.stats.packages_within_budget}
            </span>
          </div>
        </div>
      </header>

      {/* Progress log */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How we optimized your trip</h2>
        <ul className={styles.progressList}>
          {data.progress.map((step, i) => (
            <li key={i} className={styles.progressItem}>
              {step}
            </li>
          ))}
        </ul>
      </section>

      {/* Package cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Optimized packages</h2>

        {data.packages.length === 0 ? (
          <p className={styles.muted}>No packages found within this budget.</p>
        ) : (
          <div className={styles.cardGrid}>
            {data.packages.map((pkg, idx) => (
              <article key={idx} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Package {idx + 1}</h3>
                  <span
                    className={
                      pkg.status === "within-budget"
                        ? styles.badgeWithin
                        : styles.badgeOver
                    }
                  >
                    {pkg.status.replace("-", " ")}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.costRow}>
                    <span>Flight</span>
                    <span>
                      {pkg.flight
                        ? `${pkg.flight.price.toFixed(2)} ${pkg.flight.currency}`
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.costRow}>
                    <span>Hotel</span>
                    <span>
                      {pkg.hotel?.price
                        ? `${pkg.hotel.price.toFixed(2)} ${
                            pkg.hotel.currency ?? pkg.currency
                          }`
                        : "No hotel included"}
                    </span>
                  </div>
                  <div className={styles.costRow}>
                    <span>Activities</span>
                    <span>
                      {pkg.activities.toFixed(2)} {pkg.currency}
                    </span>
                  </div>
                  <div className={styles.costRow}>
                    <span>Meals</span>
                    <span>
                      {pkg.meals.toFixed(2)} {pkg.currency}
                    </span>
                  </div>
                  <div className={styles.costRow}>
                    <span>Transit</span>
                    <span>
                      {pkg.transit?.total.toFixed(2)} {pkg.currency}
                    </span>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.totalRow}>
                    <span>Total cost</span>
                    <span>
                      {pkg.total.toFixed(2)} {pkg.currency}
                    </span>
                  </div>
                  <div className={styles.remainingRow}>
                    <span>Budget remaining</span>
                    <span>
                      {pkg.budgetRemaining.toFixed(2)} {pkg.currency}
                    </span>
                  </div>
                </div>

                <footer className={styles.cardFooter}>
                  <span className={styles.fxLabel}>
                    Rates snapshot ({pkg.fxSnapshot.base}) ·{" "}
                    {new Date(pkg.fxSnapshot.ts).toLocaleString()}
                  </span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
