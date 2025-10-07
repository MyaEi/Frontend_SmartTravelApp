// export default function SmartItinerariesPage() {
//   return (
//     <div>
//       <h1>Smart Itineraries</h1>
//       <p>This is the new page you routed to!</p>
//     </div>
//   );
// }
// app/smart-itineraries/page.tsx
"use client";

import React, { useMemo, useState } from "react";

// ① If your JSON is in this folder as response.json:
import dataJson from "./response.json";

// ② If you prefer /public/data/itinerary.json instead, delete the line above
//    and use useEffect + fetch('/data/itinerary.json') to load at runtime.

// ---------- Types that match your API response ----------
type Place = {
  name: string;
  address: string;
  lat: number;
  lon: number;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  types: string[];
};

type PlanDay = {
  day: number;            // 1-based
  attractions: Place[];
  restaurants: Place[];
};

type ApiResponse = {
  destination: string;
  days: number;
  budget: number;
  budget_label: string;
  budget_description: string;
  kid_friendly: boolean;
  itinerary_text: string; // markdown
  plan_struct: PlanDay[];
};

// ---------- Small helpers ----------
const priceTo$ = (lvl: number | null | undefined) => {
  if (lvl == null) return "—";
  return "$".repeat(Math.max(1, Math.min(4, lvl)));
};

const toTitle = (s: string) =>
  s.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());

// ---------- Presentational bits ----------
function PlaceCard({ p }: { p: Place }) {
  const types = p.types
    .map(toTitle)
    .filter((t) => !["Point Of Interest", "Establishment", "Store"].includes(t))
    .slice(0, 3);

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title mb-2">{p.name}</h5>
          <div className="text-nowrap small">
            {p.rating ? (
              <>
                <span className="me-1">⭐ {p.rating.toFixed(1)}</span>
                {p.user_ratings_total ? (
                  <span className="text-muted">({p.user_ratings_total})</span>
                ) : null}
              </>
            ) : (
              <span className="badge bg-secondary">No rating</span>
            )}
          </div>
        </div>

        <p className="card-text text-muted small mb-2">{p.address}</p>

        {types.length > 0 && (
          <div className="mb-3">
            {types.map((t) => (
              <span key={t} className="badge bg-light text-dark me-2">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="d-flex gap-2">
          <a
            className="btn btn-outline-primary btn-sm"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${p.name} ${p.address}`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Maps
          </a>
          <a
            className="btn btn-outline-secondary btn-sm"
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${p.lat},${p.lon}`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Directions
          </a>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigator.clipboard.writeText(p.address)}
            type="button"
          >
            Copy address
          </button>
          <span className="ms-auto small text-muted align-self-center">
            {priceTo$(p.price_level)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function SmartItinerariesPage() {
  const data = dataJson as ApiResponse;

  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showAttr, setShowAttr] = useState(true);
  const [showFood, setShowFood] = useState(true);
  const [day, setDay] = useState<number | "all">(1);

  const days = useMemo(() => data.plan_struct.map((d) => d.day), [data]);

  const filtered = useMemo(() => {
    const matches = (p: Place) =>
      (query.trim() === "" ||
        (p.name + " " + p.address).toLowerCase().includes(query.toLowerCase())) &&
      (minRating == null || (p.rating ?? 0) >= minRating);

    const selectedDays =
      day === "all"
        ? data.plan_struct
        : data.plan_struct.filter((d) => d.day === day);

    return selectedDays.map((d) => ({
      ...d,
      attractions: showAttr ? d.attractions.filter(matches) : [],
      restaurants: showFood ? d.restaurants.filter(matches) : [],
    }));
  }, [data, query, minRating, showAttr, showFood, day]);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 mb-1">
          {data.destination} – {data.days}-Day {data.budget_label} Itinerary
        </h1>
        <p className="text-muted mb-2">{data.budget_description}</p>

        <div className="row g-2">
          <div className="col-auto">
            <span className="badge bg-light text-dark">
              Days: <strong className="ms-1">{data.days}</strong>
            </span>
          </div>
          <div className="col-auto">
            <span className="badge bg-light text-dark">
              Budget: <strong className="ms-1">{data.budget_label}</strong>
            </span>
          </div>
          <div className="col-auto">
            <span className="badge bg-light text-dark">
              Kid Friendly: <strong className="ms-1">{data.kid_friendly ? "Yes" : "No"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs" id="itTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button className="nav-link active" id="plan-tab" data-bs-toggle="tab" data-bs-target="#plan" type="button" role="tab">
            Plan
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes" type="button" role="tab">
            Itinerary Notes
          </button>
        </li>
      </ul>

      <div className="tab-content pt-3">
        {/* PLAN TAB */}
        <div className="tab-pane fade show active" id="plan" role="tabpanel">
          {/* Filters bar */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-4">
                  <input
                    className="form-control"
                    placeholder="Search name or address…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-4 d-flex align-items-center gap-2">
                  <span className="text-muted small">Min Rating</span>
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${minRating == null ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setMinRating(null)}
                    >
                      Any
                    </button>
                    <button
                      className={`btn btn-sm ${minRating === 4.0 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setMinRating(4.0)}
                    >
                      4.0+
                    </button>
                    <button
                      className={`btn btn-sm ${minRating === 4.5 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setMinRating(4.5)}
                    >
                      4.5+
                    </button>
                  </div>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-center gap-2">
                  <div className="btn-group">
                    <button
                      className={`btn btn-sm ${showAttr ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setShowAttr((v) => !v)}
                    >
                      Attractions
                    </button>
                    <button
                      className={`btn btn-sm ${showFood ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setShowFood((v) => !v)}
                    >
                      Restaurants
                    </button>
                  </div>
                </div>
              </div>

              {/* Day jump */}
              <div className="mt-3 d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${day === "all" ? "btn-secondary" : "btn-outline-secondary"}`}
                  onClick={() => setDay("all")}
                >
                  All
                </button>
                {days.map((d) => (
                  <button
                    key={d}
                    className={`btn btn-sm ${day === d ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => setDay(d)}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Day sections */}
          {filtered.map((d) => (
            <section key={d.day} className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="h5 mb-0">Day {d.day}</h2>
                <div className="small text-muted">
                  {d.attractions.length} attractions • {d.restaurants.length} restaurants
                </div>
              </div>

              <div className="row g-3">
                {/* Attractions */}
                <div className="col-12 col-lg-6">
                  <h6 className="mb-2">Attractions</h6>
                  {d.attractions.length === 0 ? (
                    <div className="text-muted small">No attractions match your filters.</div>
                  ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-3">
                      {d.attractions.map((p) => (
                        <div key={`${p.name}-${p.lat}-${p.lon}`} className="col">
                          <PlaceCard p={p} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Restaurants */}
                <div className="col-12 col-lg-6">
                  <h6 className="mb-2">Restaurants</h6>
                  {d.restaurants.length === 0 ? (
                    <div className="text-muted small">No restaurants match your filters.</div>
                  ) : (
                    <div className="row row-cols-1 row-cols-md-2 g-3">
                      {d.restaurants.map((p) => (
                        <div key={`${p.name}-${p.lat}-${p.lon}`} className="col">
                          <PlaceCard p={p} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* NOTES TAB */}
        <div className="tab-pane fade" id="notes" role="tabpanel">
          <div className="card">
            <div className="card-body">
              {/* Render markdown simply. If you want full markdown support, install react-markdown */}
              {data.itinerary_text.split("\n").map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
