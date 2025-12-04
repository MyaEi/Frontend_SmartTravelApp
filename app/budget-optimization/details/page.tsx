"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./budget.module.css";

type BudgetPackage = {
  flight: {
    id: string;
    price: number;
    currency: string;
    airline_code?: string;
    airline_name?: string;
    itineraries?: Array<{
      duration: string;
      segments: Array<{
        departure: {
          airport: string;
          terminal?: string;
          time: string;
        };
        arrival: {
          airport: string;
          terminal?: string;
          time: string;
        };
        carrier_code: string;
        carrier_name: string;
        flight_number: string;
        aircraft_code: string;
        aircraft_name: string;
        duration: string;
        stops: number;
      }>;
    }>;
  } | null;
  hotel: {
    id?: string;
    name?: string;
    price?: number;
    total?: number;
    currency?: string;
    nights?: number;
    offer_id?: string;
    room_description?: string;
  } | null;
  transit: {
    total: number;
  } | null;
  activities: {
    total: number;
    details?: Array<{
      name: string;
      price: number;
      currencyCode: string;
      duration: string;
      bookinglink: string;
    }>;
  };
  meals: number;
  currency: string;
  total: number;
  fxSnapshot: {
    base: string;
    ts: string;
  };
  status: string;
  budgetRemaining: number;
  quality_score?: number;
  quality_breakdown?: {
    value: number;
    convenience: number;
    experience: number;
    insights: string;
    model: string;
  };
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
    activities_found?: number;
    packages_within_budget: number;
    best_quality_score?: number;
  };
  budget_suggestion?: {
    flights_percent: number;
    hotels_percent: number;
    activities_percent: number;
    meals_percent: number;
    transit_percent: number;
    reasoning: string;
  };
  ai_ml_pipeline?: {
    step1_data_source: string;
    step2_meal_transit: string;
    step3_optimization: string;
    step4_scoring: string;
    step5_allocation: string;
  };
};

export default function BudgetOptimizerDetailsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [data, setData] = useState<BudgetOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<number | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);
  const [expandedActivities, setExpandedActivities] = useState<number | null>(null);

  const origin = params.get("origin") ?? "";
  const destination = params.get("destination") ?? "";
  const budget = params.get("budget") ?? "";
  const currency = params.get("currency") ?? "CAD";
  const depart_date = params.get("depart_date") ?? "";
  const return_date = params.get("return_date") ?? "";
  const travel_style = params.get("travel_style") ?? "moderate";

  const inputSummary = useMemo(
    () => ({
      origin,
      destination,
      budget,
      currency,
      depart_date,
      return_date,
      travel_style,
    }),
    [origin, destination, budget, currency, depart_date, return_date, travel_style]
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

    const payload = {
      budget: Number(budget),
      currency,
      depart_date,
      destination,
      origin,
      return_date,
      travel_style,
    };

    fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
  }, [budget, currency, depart_date, destination, origin, return_date, travel_style]);

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.title}>Optimizing your budget…</h1>
          <p className={styles.subtitle}>
            We're fetching flights and calculating extras for this trip.
          </p>
        </header>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.title}>We couldn't optimize this trip</h1>
          <p className={styles.subtitle}>{err ?? "Unknown error"}</p>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => router.back()}>
          ← Back
        </button>
        <h1 className={styles.title}>Budget optimization results</h1>
        <p className={styles.subtitle}>
          {inputSummary.origin} → {inputSummary.destination} · {inputSummary.depart_date} –{" "}
          {inputSummary.return_date} · {inputSummary.travel_style} style
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
            <span className={styles.summaryValue}>{data.total_packages} total</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Within budget</span>
            <span className={styles.summaryValue}>{data.stats.packages_within_budget}</span>
          </div>
          {data.stats.best_quality_score && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Best quality score</span>
              <span className={styles.summaryValue}>
                {data.stats.best_quality_score.toFixed(1)}/100
              </span>
            </div>
          )}
        </div>
      </header>

      {/* AI/ML Pipeline Info */}
      {data.ai_ml_pipeline && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>AI/ML Processing Pipeline</h2>
          <div className={styles.pipelineGrid}>
            <div><strong>Data Source:</strong> {data.ai_ml_pipeline.step1_data_source}</div>
            <div><strong>Cost Calculation:</strong> {data.ai_ml_pipeline.step2_meal_transit}</div>
            <div><strong>Optimization:</strong> {data.ai_ml_pipeline.step3_optimization}</div>
            <div><strong>Quality Scoring:</strong> {data.ai_ml_pipeline.step4_scoring}</div>
            <div><strong>Budget Allocation:</strong> {data.ai_ml_pipeline.step5_allocation}</div>
          </div>
        </section>
      )}

      {/* Budget Suggestion */}
      {data.budget_suggestion && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ML-Optimized Budget Allocation</h2>
          <p className={styles.reasoning}>{data.budget_suggestion.reasoning}</p>
          <div className={styles.allocationGrid}>
            <div>Flights: {data.budget_suggestion.flights_percent.toFixed(1)}%</div>
            <div>Hotels: {data.budget_suggestion.hotels_percent.toFixed(1)}%</div>
            <div>Activities: {data.budget_suggestion.activities_percent.toFixed(1)}%</div>
            <div>Meals: {data.budget_suggestion.meals_percent.toFixed(1)}%</div>
            <div>Transit: {data.budget_suggestion.transit_percent.toFixed(1)}%</div>
          </div>
        </section>
      )}

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
                      pkg.status === "within-budget" ? styles.badgeWithin : styles.badgeOver
                    }
                  >
                    {pkg.status.replace("-", " ")}
                  </span>
                  {pkg.quality_score && (
                    <span className={styles.qualityBadge}>
                      Quality: {pkg.quality_score.toFixed(1)}/100
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  {/* Flight Info */}
                  <div 
                    className={styles.costRow}
                    style={{ cursor: pkg.flight ? 'pointer' : 'default' }}
                    onClick={() => pkg.flight && setExpandedFlight(expandedFlight === idx ? null : idx)}
                  >
                    <span>
                      Flight {pkg.flight?.airline_name && `(${pkg.flight.airline_name})`}
                      {pkg.flight && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                          {expandedFlight === idx ? '▼' : '▶'}
                        </span>
                      )}
                    </span>
                    <span>
                      {pkg.flight
                        ? `${pkg.flight.price.toFixed(2)} ${pkg.flight.currency}`
                        : "—"}
                    </span>
                  </div>

                  {/* Flight Details - Expandable */}
                  {expandedFlight === idx && pkg.flight?.itineraries && (
                    <div className={styles.detailsSection}>
                      {pkg.flight.itineraries.map((itinerary, itinIdx) => (
                        <div key={itinIdx} className={styles.itinerarySection}>
                          <h5 className={styles.itineraryTitle}>
                            {itinIdx === 0 ? 'Outbound Flight' : 'Return Flight'}
                            <span className={styles.duration}>Duration: {itinerary.duration}</span>
                          </h5>
                          {itinerary.segments.map((segment, segIdx) => (
                            <div key={segIdx} className={styles.segmentCard}>
                              <div className={styles.segmentHeader}>
                                <span className={styles.carrier}>
                                  {segment.carrier_name} {segment.flight_number}
                                </span>
                                <span className={styles.aircraft}>{segment.aircraft_name}</span>
                              </div>
                              <div className={styles.flightRoute}>
                                <div className={styles.flightPoint}>
                                  <div className={styles.airportCode}>{segment.departure.airport}</div>
                                  <div className={styles.time}>
                                    {new Date(segment.departure.time).toLocaleString()}
                                  </div>
                                  {segment.departure.terminal && (
                                    <div className={styles.terminal}>Terminal {segment.departure.terminal}</div>
                                  )}
                                </div>
                                <div className={styles.flightLine}>
                                  <div className={styles.flightDuration}>{segment.duration}</div>
                                  {segment.stops === 0 && <div className={styles.directBadge}>Direct</div>}
                                </div>
                                <div className={styles.flightPoint}>
                                  <div className={styles.airportCode}>{segment.arrival.airport}</div>
                                  <div className={styles.time}>
                                    {new Date(segment.arrival.time).toLocaleString()}
                                  </div>
                                  {segment.arrival.terminal && (
                                    <div className={styles.terminal}>Terminal {segment.arrival.terminal}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hotel Info */}
                  <div 
                    className={styles.costRow}
                    style={{ cursor: pkg.hotel ? 'pointer' : 'default' }}
                    onClick={() => pkg.hotel && setExpandedHotel(expandedHotel === idx ? null : idx)}
                  >
                    <span>
                      Hotel {pkg.hotel?.name && `(${pkg.hotel.name})`}
                      {pkg.hotel && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                          {expandedHotel === idx ? '▼' : '▶'}
                        </span>
                      )}
                    </span>
                    <span>
                      {pkg.hotel && (pkg.hotel.price || pkg.hotel.total)
                        ? `${(pkg.hotel.price || pkg.hotel.total || 0).toFixed(2)} ${
                            pkg.hotel.currency ?? pkg.currency
                          }`
                        : "No hotel included"}
                    </span>
                  </div>

                  {/* Hotel Details - Expandable */}
                  {expandedHotel === idx && pkg.hotel && (
                    <div className={styles.detailsSection}>
                      <div className={styles.hotelDetails}>
                        {pkg.hotel.name && <div><strong>Hotel:</strong> {pkg.hotel.name}</div>}
                        {pkg.hotel.nights && <div><strong>Nights:</strong> {pkg.hotel.nights}</div>}
                        {pkg.hotel.room_description && (
                          <div><strong>Room:</strong> {pkg.hotel.room_description}</div>
                        )}
                        {pkg.hotel.offer_id && <div><strong>Offer ID:</strong> {pkg.hotel.offer_id}</div>}
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  <div 
                    className={styles.costRow}
                    style={{ cursor: pkg.activities.details ? 'pointer' : 'default' }}
                    onClick={() => pkg.activities.details && setExpandedActivities(expandedActivities === idx ? null : idx)}
                  >
                    <span>
                      Activities
                      {pkg.activities.details && ` (${pkg.activities.details.length} options)`}
                      {pkg.activities.details && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                          {expandedActivities === idx ? '▼' : '▶'}
                        </span>
                      )}
                    </span>
                    <span>
                      {pkg.activities.total.toFixed(2)} {pkg.currency}
                    </span>
                  </div>

                  {/* Activities Details - Expandable */}
                  {expandedActivities === idx && pkg.activities.details && (
                    <div className={styles.detailsSection}>
                      <div className={styles.activitiesGrid}>
                        {pkg.activities.details.map((activity, actIdx) => (
                          <div key={actIdx} className={styles.activityCard}>
                            <div className={styles.activityHeader}>
                              <h5 className={styles.activityName}>{activity.name}</h5>
                              <span className={styles.activityPrice}>
                                {activity.price.toFixed(2)} {activity.currencyCode}
                              </span>
                            </div>
                            {activity.duration && (
                              <div className={styles.activityDuration}>
                                ⏱️ Duration: {activity.duration}
                              </div>
                            )}
                            {activity.bookinglink && (
                              <a
                                href={activity.bookinglink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.bookingLink}
                              >
                                View Details & Book →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meals */}
                  <div className={styles.costRow}>
                    <span>Meals</span>
                    <span>
                      {pkg.meals.toFixed(2)} {pkg.currency}
                    </span>
                  </div>

                  {/* Transit */}
                  <div className={styles.costRow}>
                    <span>Transit</span>
                    <span>
                      {pkg.transit?.total.toFixed(2)} {pkg.currency}
                    </span>
                  </div>

                  <div className={styles.divider} />

                  {/* Total */}
                  <div className={styles.totalRow}>
                    <span>Total cost</span>
                    <span>
                      {pkg.total.toFixed(2)} {pkg.currency}
                    </span>
                  </div>

                  {/* Budget Remaining */}
                  <div className={styles.remainingRow}>
                    <span>Budget remaining</span>
                    <span>
                      {pkg.budgetRemaining.toFixed(2)} {pkg.currency}
                    </span>
                  </div>

                  {/* Quality Breakdown */}
                  {pkg.quality_breakdown && (
                    <>
                      <div className={styles.divider} />
                      <div className={styles.qualitySection}>
                        <h4>Quality Analysis ({pkg.quality_breakdown.model})</h4>
                        <div className={styles.qualityMetrics}>
                          <div>Value: {pkg.quality_breakdown.value.toFixed(1)}/100</div>
                          <div>Convenience: {pkg.quality_breakdown.convenience.toFixed(1)}/100</div>
                          <div>Experience: {pkg.quality_breakdown.experience.toFixed(1)}/100</div>
                        </div>
                        <p className={styles.insights}>{pkg.quality_breakdown.insights}</p>
                      </div>
                    </>
                  )}
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
