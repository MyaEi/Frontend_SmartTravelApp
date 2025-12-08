"use client";


import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./seasonal.module.css";

export default function SeasonalCombined() {
    useEffect(() => {
        document.body.classList.add("page-seasonal");
        document.documentElement.classList.add("page-seasonal");

        return () => {
            document.body.classList.remove("page-seasonal");
            document.documentElement.classList.remove("page-seasonal");
        };
    }, []);


    const params = useSearchParams();
    const router = useRouter();

    const destination = params.get("to");
    const startParam = params.get("start") || "";
    const endParam = params.get("end") || "";

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>("");

    const [userInput, setUserInput] = useState({
        to: "",
        start: "",
        end: "",
    });

    // -----------------------------
    // 🔧 EVENT IMAGE FIX
    // -----------------------------
    const getEventImage = (event: any) => {
        if (event.image) return event.image;

        // fallback Unsplash
        return `https://images.unsplash.com/photo-1519681393784-d120267933ba`;
    };


    // -----------------------------
    // 🔧 INPUT HANDLERS
    // -----------------------------
    const handleChange = (e: any) => {
        setUserInput({ ...userInput, [e.target.name]: e.target.value });
    };

    // -----------------------------
    // 🔎 SEARCH SUBMIT
    // -----------------------------
    const handleSearch = (e: any) => {
        e.preventDefault();

        const year = new Date().getFullYear();
        const start = userInput.start || `${year}-01-01`;
        const end = userInput.end || `${year}-12-31`;

        const query = new URLSearchParams({
            to: userInput.to,
            start,
            end
        }).toString();

        router.push(`/seasonal-suggestions/details?${query}`);
    };

    // -----------------------------
    // 🧹 DEDUPE EVENTS
    // -----------------------------
    const dedupeEvents = (events: any[]) => {
        const map = new Map();
        events.forEach((e) => {
            const key = `${e.name}-${e.date}`;
            if (!map.has(key)) {
                map.set(key, e);
            }
        });
        return Array.from(map.values());
    };

    // -----------------------------
    // 📡 FETCH DATA
    // -----------------------------
    useEffect(() => {
        async function fetchData() {
            if (!destination) return;

            try {
                setLoading(true);
                setError("");

                const year = new Date().getFullYear();
                const start = startParam || `${year}-01-01`;
                const end = endParam || `${year}-12-31`;

                const query = new URLSearchParams({
                    to: destination,
                    start,
                    end,
                    use_llm: "false",
                }).toString();

                const res = await fetch(`/api/seasonal?${query}`, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error(`API error: ${res.status}`);
                }

                const json = await res.json();

                const normalized = {
                    status: json.status || "ok",
                    meta: json.meta || {},
                    results: {
                        attractions: Array.isArray(json.results?.attractions)
                            ? json.results.attractions
                            : [],
                        events: Array.isArray(json.results?.events)
                            ? json.results.events
                            : [],
                    },
                };

                normalized.results.attractions.sort(
                    (a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)
                );

                normalized.results.events.sort(
                    (a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)
                );

                setData(normalized);
            } catch (err: any) {
                setError(err.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [destination, startParam, endParam]);

    // -----------------------------
    // UI RENDER
    // -----------------------------
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.backHome}>
                <a href="/" className={styles.backHomeLink}>← Back to Home</a>
            </div>

            {/* HERO */}
            <div className={styles.heroWrapper}>
                <h1 className={styles.heroTitle}>Find Your Dream Vacation Location</h1>
                <p className={styles.heroSubtitle}>
                    Search attractions and seasonal recommendations for any destination
                </p>
            </div>

            {/* SEARCH FORM */}
            <div className={styles.searchHeader}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        name="to"
                        className={styles.input}
                        placeholder="Destination (e.g., Tokyo)"
                        value={userInput.to}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="date"
                        name="start"
                        className={styles.input}
                        value={userInput.start}
                        onChange={handleChange}
                    />

                    <input
                        type="date"
                        name="end"
                        className={styles.input}
                        value={userInput.end}
                        onChange={handleChange}
                    />

                    <button type="submit" className={styles.searchButton}>🔍 Search</button>
                </form>
            </div>

            {/* LOADING */}
            {loading && (
                <div className={styles.loadingWrapper}>
                    <div className={styles.plane}>🛫</div>
                    <div className={styles.plane}>✈──────────────►</div>
                    <div className={styles.loadingText}>Loading attractions...</div>
                    <div className={styles.plane}>✈──────────────►</div>
                    <div className={styles.plane}>🛬</div>
                </div>
            )}

            {/* ERROR */}
            {error && (
                <div style={{ color: "red", fontSize: "20px", marginTop: "20px" }}>
                    ❌ {error}
                </div>
            )}

            {/* RESULTS */}
            {destination && !loading && data && (
                <div className={styles.detailsWrapper}>
                    <h1 className={styles.title}>
                        {data.meta.destination}
                    </h1>

                    <h2 className={styles.subtitle}>
                        Best season: {data.meta.best_season || "Not available"}
                    </h2>

                    {/* Quick Navigation */}
                    {/* <div className={styles.quickLinks}>
            {data.results.attractions.length > 0 && (
              <a href="#attractions" className={styles.quickLink}>Attractions ↓</a>
            )}
            <a href="#events" className={styles.quickLink}>Events & Holidays ↓</a>
          </div> */}

                    {/* ATTRACTIONS SECTION */}
                    {data.results.attractions.length > 0 && (
                        <>
                            <h2 id="attractions" className={styles.sectionTitle}>Attractions</h2>

                            <div className={styles.grid}>
                                {data.results.attractions.map((a: any, i: number) => (
                                    <div key={i} className={styles.card}>
                                        <img
                                            src={a.image}
                                            alt={a.name}
                                            className={styles.cardImage}
                                            onError={(e) =>
                                            (e.currentTarget.src =
                                                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png")
                                            }
                                        />

                                        <div className={styles.cardInfo}>
                                            <h2 className={styles.cardTitle}>{a.name}</h2>

                                            <div className={styles.popularityBadge}>
                                                ⭐ Popularity: {a.popularity_score?.toFixed(1) || 0}
                                            </div>

                                            <p className={styles.cardDescription}>
                                                {a.description ||
                                                    `A notable attraction in ${data.meta.destination}.`}
                                            </p>

                                            <a
                                                href={`https://www.google.com/search?q=${encodeURIComponent(
                                                    `${a.name} ${data.meta.destination}`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.detailsLink}
                                            >
                                                View More →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* EVENTS SECTION */}
                    {/* {dedupeEvents(data.results.events).length > 0 && (
            <>
              <h2 id="events" className={styles.sectionTitle}>Events & Holidays</h2>

              <div className={styles.grid}>
                {dedupeEvents(data.results.events)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())   // ⬅ DATE SORT FIX
                  .map((e: any, i: number) => (
                    <div key={i} className={styles.card}>
                      <img
                        src={getEventImage(e)}
                        alt={e.name}
                        className={styles.cardImage}
                        onError={(ev) =>
                        (ev.currentTarget.src =
                          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png")
                        }
                      />

                      <div className={styles.cardInfo}>
                        <h2 className={styles.cardTitle}>{e.name}</h2>

                        <div className={styles.popularityBadge}>
                          ⭐ Popularity: {e.popularity_score?.toFixed(1) || 0}
                        </div>

                        <p className={styles.cardDescription}>{e.description}</p>
                        <p className={styles.cardDescription}>{e.date}</p>

                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            `${e.name} ${data.meta.destination}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.detailsLink}
                        >
                          Learn More →
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )} */}
                    <h2 id="events" className={styles.sectionTitle}>Events & Holidays</h2>

                    <div className={styles.grid}>
                        {dedupeEvents(data.results.events).map((e: any, i: number) => (
                            <div key={i} className={styles.card}>

                                <img
                                    src={e.image}
                                    alt={e.name}
                                    className={styles.cardImage}
                                    onError={(e2) =>
                                    (e2.currentTarget.src =
                                        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80")
                                    }
                                />

                                <div className={styles.cardInfo}>
                                    <h2 className={styles.cardTitle}>{e.name}</h2>

                                    <div className={styles.popularityBadge}>
                                        ⭐ Popularity: {e.popularity_score?.toFixed(1) || 0}
                                    </div>

                                    <p className={styles.cardDescription}>{e.description}</p>
                                    <p className={styles.cardDescription}>{e.date}</p>

                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent(
                                            `${e.name} ${data.meta.destination} holiday`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.detailsLink}
                                    >
                                        Learn More →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}
