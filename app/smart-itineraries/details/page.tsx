"use client";

import React, { useMemo, useState, useEffect } from "react";
import styles from "./itinerary.module.css";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Slider from "react-slick";

// ---------- Types matching the response ----------
type Place = {
  name: string;
  address: string;
  lat: number;
  lon: number;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null; // 0..4 (or null)
  types: string[];
};

type PlanDay = {
  day: number; // 1-based
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
  itinerary_text: string;
  plan_struct: PlanDay[];
};

// ---------- Helpers ----------
const priceTo$ = (lvl?: number | null) => {
  if (lvl == null) return "—";
  const clamped = Math.max(0, Math.min(4, lvl));
  return "$".repeat(clamped || 1);
};

const prettyTypes = (ts: string[]) =>
  ts
    .map((t) => t.replaceAll("_", " "))
    .filter(
      (t) =>
        !["point of interest", "establishment", "store"].includes(
          t.toLowerCase()
        )
    )
    .slice(0, 3);

const mapsSearch = (p: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${p.name} ${p.address}`
  )}`;

const mapsDir = (p: Place) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${p.lat},${p.lon}`
  )}`;

// ---------- Small UI bits ----------
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${active ? styles.pillActive : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PlaceCard({ p }: { p: Place }) {
  const tags = prettyTypes(p.types);
  const photos = p?.photo_urls || [];

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  return (
    <div className={styles.card}>
      {/* --- Photo Section --- */}
      {/* --- Carousel Section --- */}
      {photos.length > 0 && (
        <div className={styles.carouselWrap}>
          <Slider {...settings}>
            {photos.map((url, idx) => (
              <div key={idx} className={styles.slide}>
                <img
                  src={`/api/photo-proxy?url=${encodeURIComponent(url)}`}
                  alt={`${p.name} photo ${idx + 1}`}
                  className={styles.slideImg}
                  loading="lazy"
                />
              </div>
            ))}
          </Slider>
        </div>
      )}

      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{p.name}</h3>

        <div className={styles.ratingWrap}>
          {typeof p.rating === "number" ? (
            <>
              <svg
                viewBox="0 0 24 24"
                className={styles.starIcon}
                aria-hidden="true"
              >
                <path d="M12 17.3l6.18 3.7-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" />
              </svg>
              <span className={styles.ratingNum}>{p.rating.toFixed(1)}</span>
              {p.user_ratings_total ? (
                <span className={styles.ratingCount}>({p.user_ratings_total})</span>
              ) : null}
            </>
          ) : (
            <span className={styles.badgeMuted}>No rating</span>
          )}
          <span className={styles.priceBadge}>{priceTo$(p.price_level)}</span>
        </div>
      </div>

      <div className={styles.addrRow}>{p.address}</div>

      {tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      )}

      <div className={styles.actionsRow}>
        <a
          className={styles.btnOutline}
          href={mapsSearch(p)}
          target="_blank"
          rel="noreferrer"
        >
          Open in Maps
        </a>
        <a
          className={styles.btnGhost}
          href={mapsDir(p)}
          target="_blank"
          rel="noreferrer"
        >
          Directions
        </a>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => navigator.clipboard.writeText(p.address)}
        >
          Copy address
        </button>
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function SmartItinerariesPage() {
  const params = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // local UI state (kept exactly as you have it)
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showAttr, setShowAttr] = useState(true);
  const [showFood, setShowFood] = useState(true);
  const [day, setDay] = useState<number | "all">(1);

  // Build the query string for the API from the URL params
  useEffect(() => {
    const destination = params.get("destination") ?? "";
    const days = Number(params.get("days") ?? "0");
    const budget = Number(params.get("budget") ?? "0");
    const kid_friendly = (params.get("kid_friendly") ?? "false") === "true";
    const travel_type = (params.get("travel_type") ?? "").toLowerCase();
    const activity_theme = (params.get("activity_theme") ?? "").toLowerCase();

    // Minimal guard: require destination & days
    if (!destination || !days) {
      setErr("Missing required search parameters.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetch("/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        days,
        budget,
        kid_friendly,
        travel_type,
        activity_theme,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
        return r.json();
      })
      .then((json: ApiResponse) => !cancelled && setData(json))
      .catch((e) => !cancelled && setErr(e.message || "Failed to load itinerary"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [params]);

  // from here, everything below is exactly like your current render
  const daysList = useMemo(
    () => data?.plan_struct.map((d) => d.day) ?? [],
    [data]
  );

  const filtered = useMemo(() => {
    if (!data) return []; // <- prevents map on undefined

    const matches = (p: Place) => {
      const qok =
        query.trim() === "" ||
        (p.name + " " + p.address).toLowerCase().includes(query.toLowerCase());
      const rok = minRating == null || (p.rating ?? 0) >= minRating;
      return qok && rok;
    };

    const chosen =
      day === "all"
        ? data.plan_struct
        : data.plan_struct.filter((d) => d.day === day);

    return chosen.map((d) => ({
      ...d,
      attractions: showAttr ? d.attractions.filter(matches) : [],
      restaurants: showFood ? d.restaurants.filter(matches) : [],
    }));
  }, [data, query, minRating, showAttr, showFood, day]);

  // Early states
  if (loading) {
    return (
      <div className={styles.pageWrap}>
        <header className={styles.header}>
          <h1 className={styles.title}>Building your itinerary…</h1>
          <p className={styles.subtitle}>Fetching recommendations and routes.</p>
        </header>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className={styles.pageWrap}>
        <header className={styles.header}>
          <h1 className={styles.title}>We couldn’t build that itinerary</h1>
          <p className={styles.subtitle}>{err ?? "Unknown error"}</p>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          {data.destination} – {data.days}-Day {data.budget_label} Itinerary
        </h1>
        <p className={styles.subtitle}>{data.budget_description}</p>

        <div className={styles.statsRow}>
          <Stat label="Days" value={String(data.days)} />
          <Stat label="Budget" value={data.budget_label} />
          <Stat label="Kid Friendly" value={data.kid_friendly ? "Yes" : "No"} />
        </div>
      </header>

      <section className={styles.controls}>
        <div className={styles.controlGroup}>
          <div className={styles.searchWrap}>
            <svg
              viewBox="0 0 24 24"
              className={styles.searchIcon}
              aria-hidden="true"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search name or address…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.minRatingWrap}>
            <span className={styles.muted}>Min Rating</span>
            <div className={styles.pillGroup}>
              <Pill active={minRating == null} onClick={() => setMinRating(null)}>
                Any
              </Pill>
              <Pill active={minRating === 4.0} onClick={() => setMinRating(4.0)}>
                4.0+
              </Pill>
              <Pill active={minRating === 4.5} onClick={() => setMinRating(4.5)}>
                4.5+
              </Pill>
            </div>
          </div>

          <div className={styles.toggleWrap}>
            <Pill active={showAttr} onClick={() => setShowAttr((v) => !v)}>
              Attractions
            </Pill>
            <Pill active={showFood} onClick={() => setShowFood((v) => !v)}>
              Restaurants
            </Pill>
          </div>
        </div>

        <div className={styles.dayJump}>
          <span className={styles.muted}>Jump to:</span>
          <Pill active={day === "all"} onClick={() => setDay("all")}>
            All
          </Pill>
          {daysList.map((d) => (
            <Pill key={d} active={day === d} onClick={() => setDay(d)}>
              Day {d}
            </Pill>
          ))}
        </div>
      </section>

      {/* Content */}
      <main className={styles.daysWrap}>
        {filtered.map((d) => (
          <section key={d.day} className={styles.daySection}>
            <div className={styles.dayHeader}>
              <h2 className={styles.dayTitle}>Day {d.day}</h2>
              <div className={styles.dayMeta}>
                {d.attractions.length} attractions • {d.restaurants.length} restaurants
              </div>
            </div>

            <div className={styles.twoCol}>
              {/* Attractions */}
              <div>
                <div className={styles.colHeader}>Attractions</div>
                {d.attractions.length === 0 ? (
                  <div className={styles.empty}>No attractions match your filters.</div>
                ) : (
                  <div className={styles.cardGrid}>
                    {d.attractions.map((p) => (
                      <PlaceCard key={`${p.name}-${p.lat}-${p.lon}`} p={p} />
                    ))}
                  </div>
                )}
              </div>

              {/* Restaurants */}
              <div>
                <div className={styles.colHeader}>Restaurants</div>
                {d.restaurants.length === 0 ? (
                  <div className={styles.empty}>No restaurants match your filters.</div>
                ) : (
                  <div className={styles.cardGrid}>
                    {d.restaurants.map((p) => (
                      <PlaceCard key={`${p.name}-${p.lat}-${p.lon}`} p={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* Notes */}
      <section className={styles.notesWrap}>
        <h3 className={styles.notesTitle}>Itinerary Notes</h3>
        <div className={styles.notesContent}>
          <ReactMarkdown>{data.itinerary_text}</ReactMarkdown>
        </div>
      </section>

    </div>
  );
}
