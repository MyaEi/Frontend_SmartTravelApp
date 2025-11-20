"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./sentiment-search.module.css";

type PlaceSummary = {
    name: string;
    address: string;
    rating: number;
    user_ratings_total: number;
    place_id: string;
};

type SentimentSample = {
    text: string;
    label: string;
    score: number;
};

type SentimentDetails = {
    place_id: string;
    num_reviews: number;
    summary: string;
    avg_score: number;
    positive_ratio: number;
    keywords: string[];
    human_summary: string;
    samples: SentimentSample[];
};

type SentimentApiResponse = {
    place: PlaceSummary;
    sentiment: SentimentDetails;
};

export default function AttractionSentimentPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [data, setData] = useState<SentimentApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) {
            setErr("Please enter an attraction name.");
            setData(null);
            return;
        }

        setLoading(true);
        setErr(null);
        setData(null);

        try {
            const res = await fetch(
                `/api/sentiment?query=${encodeURIComponent(trimmed)}`
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Request failed with status ${res.status}`);
            }

            const json: SentimentApiResponse = await res.json();
            setData(json);
        } catch (e: any) {
            setErr(e.message || "Failed to analyze this place.");
        } finally {
            setLoading(false);
        }
    };

    const sentiment = data?.sentiment;
    const place = data?.place;

    return (
        <div className={styles.pageWrap}>
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
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>Attraction Review Insights</h1>
                <p className={styles.subtitle}>
                    Type an attraction name (e.g. &quot;Eiffel Tower&quot;) to see a
                    summary of what travelers are saying.
                </p>
            </header>

            {/* Search Bar */}
            <section className={styles.searchSection}>
                <form onSubmit={handleSubmit} className={styles.searchForm}>
                    <div className={styles.searchInputWrap}>
                        <svg
                            viewBox="0 0 24 24"
                            className={styles.searchIcon}
                            aria-hidden="true"
                        >
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search an attraction, e.g. Eiffel Tower"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.searchButton}
                        disabled={loading}
                    >
                        {loading ? "Analyzing…" : "Analyze Reviews"}
                    </button>
                </form>

                {err && <p className={styles.errorText}>{err}</p>}

                {!data && !err && !loading && (
                    <p className={styles.hintText}>
                        Try something like <strong>&quot;Eiffel Tower&quot;</strong>,{" "}
                        <strong>&quot;Louvre Museum&quot;</strong>, or{" "}
                        <strong>&quot;Tokyo Skytree&quot;</strong>.
                    </p>
                )}
            </section>

            {/* Result Panel */}
            {data && (
                <main className={styles.resultPanel}>
                    {/* Place Summary */}
                    <section className={styles.placeSection}>
                        <div className={styles.placeHeader}>
                            <h2 className={styles.placeName}>{place?.name}</h2>
                            <span className={styles.placeBadge}>Traveler Sentiment</span>
                        </div>
                        <p className={styles.placeAddress}>{place?.address}</p>

                        <div className={styles.placeStatsRow}>
                            <div className={styles.placeStat}>
                                <span className={styles.placeStatLabel}>Google Rating</span>
                                <div className={styles.placeStatMain}>
                                    <span className={styles.placeStatNumber}>
                                        {place?.rating?.toFixed(1)}
                                    </span>
                                    <span className={styles.placeStatSub}>
                                        {place?.user_ratings_total?.toLocaleString()} reviews
                                    </span>
                                </div>
                            </div>

                            <div className={styles.placeStat}>
                                <span className={styles.placeStatLabel}>Positive Reviews</span>
                                <div className={styles.placeStatMain}>
                                    <span className={styles.placeStatNumber}>
                                        {sentiment?.positive_ratio.toFixed(0)}%
                                    </span>
                                    <span className={styles.placeStatSub}>
                                        Based on {sentiment?.num_reviews} sampled reviews
                                    </span>
                                </div>
                            </div>

                            <div className={styles.placeStat}>
                                <span className={styles.placeStatLabel}>Avg Sentiment Score</span>
                                <div className={styles.placeStatMain}>
                                    <span className={styles.placeStatNumber}>
                                        {sentiment?.avg_score.toFixed(2)}
                                    </span>
                                    <span className={styles.placeStatSub}>
                                        {sentiment?.summary}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Human Summary */}
                    <section className={styles.sectionBlock}>
                        <h3 className={styles.sectionTitle}>Overall vibe</h3>
                        <p className={styles.humanSummary}>{sentiment?.human_summary}</p>
                    </section>

                    {/* Keywords */}
                    {sentiment?.keywords?.length ? (
                        <section className={styles.sectionBlock}>
                            <h3 className={styles.sectionTitle}>What people mention</h3>
                            <div className={styles.keywordChips}>
                                {sentiment.keywords.map((k) => (
                                    <span key={k} className={styles.keywordChip}>
                                        #{k}
                                    </span>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {/* Sample Reviews */}
                    {sentiment?.samples?.length ? (
                        <section className={styles.sectionBlock}>
                            <h3 className={styles.sectionTitle}>Sample reviews</h3>
                            <div className={styles.samplesGrid}>
                                {sentiment.samples.map((s, idx) => (
                                    <article key={idx} className={styles.sampleCard}>
                                        <div className={styles.sampleMeta}>
                                            <span className={styles.sampleLabel}>
                                                {s.label === "POSITIVE" ? "Positive" : s.label}
                                            </span>
                                            <span className={styles.sampleScore}>
                                                Score {s.score.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className={styles.sampleText}>{s.text}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </main>
            )}
        </div>
    );
}
