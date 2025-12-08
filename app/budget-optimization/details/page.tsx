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
          terminal: string;
          time: string;
        };
        arrival: {
          airport: string;
          terminal: string;
          time: string;
        };
        carrier_code: string;
        carrier_name?: string;
        flight_number: string;
        aircraft_code: string;
        aircraft_name?: string;
        duration: string;
        stops: number;
      }>;
    }>;
  } | null;
  hotel: {
    id?: string;
    name?: string;
    price?: number;
    currency?: string;
    nights?: number;
    room_description?: string;  // Add this field
  } | null;
  transit: {
    total: number;
    reasoning?: string;
  } | null;
  activities: {
    total: number;
    details?: any[];
  };
  meals: {
    total: number;
    reasoning?: string;
  };
  currency: string;
  total: number;
  fxSnapshot: {
    base: string;
    ts: string;
  };
  status: string;
  budgetRemaining: number;
  quality_score?: number;  // Add this field
  quality_breakdown?: {    // Add this field
    value?: number;
    convenience?: number;
    experience?: number;
    insights?: string;
    model?: string;
  };
};

type BudgetOptimizeResponse = {
  success: boolean;
  packages: BudgetPackage[];
  total_packages: number;
  message: string;
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
  
  // State for showing reasoning
  const [showTransitReasoning, setShowTransitReasoning] = useState<Record<number, boolean>>({});
  const [showMealsReasoning, setShowMealsReasoning] = useState<Record<number, boolean>>({});
  const [showActivitiesDetails, setShowActivitiesDetails] = useState<Record<number, boolean>>({});
  const [showFlightDetails, setShowFlightDetails] = useState<Record<number, boolean>>({});  // Add this
  const [showHotelDetails, setShowHotelDetails] = useState<Record<number, boolean>>({});    // Add this

  // Add state for showing score explanations
  const [showScoreHelp, setShowScoreHelp] = useState<Record<number, boolean>>({});

  // Add state for showing individual metric help
  const [showMetricHelp, setShowMetricHelp] = useState<Record<string, boolean>>({});

  // Use city names for origin and destination
  const origin = params.get("origin") ?? ""; // City name for origin
  const destination = params.get("destination") ?? ""; // City name for destination
  const budget = params.get("budget") ?? "";
  const currency = params.get("currency") ?? "CAD";
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
    }),
    [origin, destination, budget, currency, depart_date, return_date]
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
    };

    // Add AbortController to cancel the request if component unmounts
    const abortController = new AbortController();

    fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal, // Add abort signal
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
        return r.json();
      })
      .then((json: BudgetOptimizeResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (e.name !== 'AbortError' && !cancelled) {
          setErr(e.message || "Failed to optimize trip");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      abortController.abort(); // Cancel the fetch request on cleanup
    };
  }, [budget, currency, depart_date, destination, origin, return_date]);

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
          
          {/* Loading Spinner */}
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
          
          <h1 className={styles.title}>Optimizing your budget…</h1>
          <p className={styles.subtitle}>
            This may take time. We're:
          </p>
          <ul className={styles.loadingSteps}>
            <li>Searching for flights</li>
            <li>Finding hotels</li>
            <li>Discovering activities</li>
            <li>AI analyzing costs</li>
            <li>Creating packages</li>
          </ul>
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

      {/* Package cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Optimized packages</h2>

        {data.packages.length === 0 ? (
          <p className={styles.muted}>No packages found within this budget.</p>
        ) : (
          <div className={styles.cardGrid}>
            {data.packages.map((pkg, idx) => {
              // Determine if this is the best package
              const isBestPick = idx === 0 && data.packages.length > 1;
              const qualityScore = pkg.quality_score || 0;
              
              return (
                <article key={idx} className={`${styles.card} ${isBestPick ? styles.bestPick : ''}`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>
                        Package {idx + 1}
                        {isBestPick && <span className={styles.bestBadge}>⭐ BEST PICK</span>}
                      </h3>
                      <div className={styles.scoreRow}>
                        <span className={styles.scoreLabel}>Quality Score:</span>
                        <span className={styles.scoreValue}>{qualityScore.toFixed(1)}/100</span>
                      </div>
                    </div>
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

                  {/* Show quality breakdown with individual info icons */}
                  {pkg.quality_breakdown && (
                    <div className={styles.qualityBar}>
                      <div className={styles.qualityMetric}>
                        <span>
                          Budget Efficiency:
                          <button
                            className={styles.infoIcon}
                            onClick={() =>
                              setShowMetricHelp((prev) => ({
                                ...prev,
                                [`budget-${idx}`]: !prev[`budget-${idx}`],
                              }))
                            }
                          >
                            ℹ️
                          </button>
                        </span>
                        <span>{pkg.quality_breakdown.value?.toFixed(0)}/40</span>
                        {showMetricHelp[`budget-${idx}`] && (
                          <div className={styles.tooltip}>
                            How well you're using your budget. Optimal is 85-95% utilization. Maximum 40 points.
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.qualityMetric}>
                        <span>
                          Travel Comfort:
                          <button
                            className={styles.infoIcon}
                            onClick={() =>
                              setShowMetricHelp((prev) => ({
                                ...prev,
                                [`comfort-${idx}`]: !prev[`comfort-${idx}`],
                              }))
                            }
                          >
                            ℹ️
                          </button>
                        </span>
                        <span>{pkg.quality_breakdown.convenience?.toFixed(0)}/30</span>
                        {showMetricHelp[`comfort-${idx}`] && (
                          <div className={styles.tooltip}>
                            Quality of flights (direct vs layovers) and hotel amenities (WiFi, breakfast, pool, etc.). Maximum 30 points.
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.qualityMetric}>
                        <span>
                          Activity Richness:
                          <button
                            className={styles.infoIcon}
                            onClick={() =>
                              setShowMetricHelp((prev) => ({
                                ...prev,
                                [`activity-${idx}`]: !prev[`activity-${idx}`],
                              }))
                            }
                          >
                            ℹ️
                          </button>
                        </span>
                        <span>{pkg.quality_breakdown.experience?.toFixed(0)}/30</span>
                        {showMetricHelp[`activity-${idx}`] && (
                          <div className={styles.tooltip}>
                            Number and variety of activities included. 5+ activities = maximum 30 points.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show insights */}
                  {pkg.quality_breakdown?.insights && (
                    <div className={styles.insightsBox}>
                      {/* <div className={styles.modelBadge}>
                        AI Analysis ({pkg.quality_breakdown.model || "XGBoost"})
                      </div> */}
                      {pkg.quality_breakdown.insights}
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    {/* Flight with expandable details */}
                    <div className={styles.costRow}>
                      <span
                        className={styles.clickable}
                        onClick={() =>
                          setShowFlightDetails((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                      >
                        Flight {showFlightDetails[idx] ? "▼" : "▶"}
                      </span>
                      <span>
                        {pkg.flight
                          ? `${pkg.flight.price.toFixed(2)} ${pkg.flight.currency}`
                          : "—"}
                      </span>
                    </div>
                    {showFlightDetails[idx] && pkg.flight && (
                      <div className={styles.detailsBox}>
                        <h4 className={styles.detailsTitle}>Flight Details:</h4>
                        <div className={styles.flightInfo}>
                          <p><strong>Airline:</strong> {pkg.flight.airline_name || pkg.flight.airline_code || "N/A"}</p>
                          <p><strong>Flight ID:</strong> {pkg.flight.id}</p>
                          
                          {pkg.flight.itineraries && pkg.flight.itineraries.map((itinerary, iIdx) => (
                            <div key={iIdx} className={styles.itinerarySection}>
                              <h5 className={styles.itineraryTitle}>
                                {iIdx === 0 ? "Outbound Flight" : "Return Flight"}
                                <span className={styles.duration}>Duration: {itinerary.duration}</span>
                              </h5>
                              
                              {itinerary.segments.map((segment, sIdx) => (
                                <div key={sIdx} className={styles.segmentCard}>
                                  <div className={styles.segmentHeader}>
                                    <span className={styles.carrier}>
                                      {segment.carrier_name || segment.carrier_code} {segment.flight_number}
                                    </span>
                                    <span className={styles.aircraft}>
                                      {segment.aircraft_name || `Aircraft ${segment.aircraft_code}`}
                                    </span>
                                  </div>
                                  
                                  <div className={styles.flightRoute}>
                                    <div className={styles.flightPoint}>
                                      <div className={styles.airportCode}>{segment.departure.airport}</div>
                                      <div className={styles.time}>
                                        {new Date(segment.departure.time).toLocaleTimeString([], { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </div>
                                      {segment.departure.terminal && (
                                        <div className={styles.terminal}>Terminal {segment.departure.terminal}</div>
                                      )}
                                    </div>
                                    
                                    <div className={styles.flightLine}>
                                      <div className={styles.flightDuration}>{segment.duration}</div>
                                      {segment.stops === 0 ? (
                                        <div className={styles.directBadge}>Direct</div>
                                      ) : (
                                        <div>{segment.stops} stop(s)</div>
                                      )}
                                    </div>
                                    
                                    <div className={styles.flightPoint}>
                                      <div className={styles.airportCode}>{segment.arrival.airport}</div>
                                      <div className={styles.time}>
                                        {new Date(segment.arrival.time).toLocaleTimeString([], { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
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
                      </div>
                    )}
                    
                    {/* Hotel with expandable details */}
                    <div className={styles.costRow}>
                      <span
                        className={styles.clickable}
                        onClick={() =>
                          setShowHotelDetails((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                      >
                        Hotel {showHotelDetails[idx] ? "▼" : "▶"}
                      </span>
                      <span>
                        {pkg.hotel?.price
                          ? `${pkg.hotel.price.toFixed(2)} ${
                              pkg.hotel.currency ?? pkg.currency
                            }`
                          : "No hotel included"}
                      </span>
                    </div>
                    {showHotelDetails[idx] && pkg.hotel && (
                      <div className={styles.detailsBox}>
                        <h4 className={styles.detailsTitle}>Hotel Details:</h4>
                        <div className={styles.hotelInfo}>
                          <p><strong>Name:</strong> {pkg.hotel.name}</p>
                          <p><strong>Hotel ID:</strong> {pkg.hotel.id}</p>
                          {pkg.hotel.room_description && (
                            <p><strong>Room:</strong> {pkg.hotel.room_description}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Activities with expandable details */}
                    <div className={styles.costRow}>
                      <span
                        className={styles.clickable}
                        onClick={() =>
                          setShowActivitiesDetails((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                      >
                        Activities {showActivitiesDetails[idx] ? "▼" : "▶"}
                      </span>
                      <span>
                        {pkg.activities.total.toFixed(2)} {pkg.currency}
                      </span>
                    </div>
                    {showActivitiesDetails[idx] && pkg.activities.details && (
                      <div className={styles.detailsBox}>
                        <h4 className={styles.detailsTitle}>Activity Breakdown:</h4>
                        <ul className={styles.detailsList}>
                          {pkg.activities.details.map((activity, i) => (
                            <li key={i}>
                              <strong>{activity.name}</strong>: {activity.price.toFixed(2)} {activity.currencyCode}
                              {activity.bookinglink && (
                                <a
                                  href={activity.bookinglink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.bookLink}
                                >
                                  Book
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Meals with reasoning */}
                    <div className={styles.costRow}>
                      <span
                        className={styles.clickable}
                        onClick={() =>
                          setShowMealsReasoning((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                      >
                        Meals {showMealsReasoning[idx] ? "▼" : "▶"}
                      </span>
                      <span>
                        {pkg.meals.total.toFixed(2)} {pkg.currency}
                      </span>
                    </div>
                    {showMealsReasoning[idx] && pkg.meals.reasoning && (
                      <div className={styles.reasoningBox}>
                        <p className={styles.reasoning}>{pkg.meals.reasoning}</p>
                      </div>
                    )}
                    
                    {/* Transit with reasoning */}
                    <div className={styles.costRow}>
                      <span
                        className={styles.clickable}
                        onClick={() =>
                          setShowTransitReasoning((prev) => ({
                            ...prev,
                            [idx]: !prev[idx],
                          }))
                        }
                      >
                        Transit {showTransitReasoning[idx] ? "▼" : "▶"}
                      </span>
                      <span>
                        {pkg.transit?.total.toFixed(2)} {pkg.currency}
                      </span>
                    </div>
                    {showTransitReasoning[idx] && pkg.transit?.reasoning && (
                      <div className={styles.reasoningBox}>
                        <p className={styles.reasoning}>{pkg.transit.reasoning}</p>
                      </div>
                    )}

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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
