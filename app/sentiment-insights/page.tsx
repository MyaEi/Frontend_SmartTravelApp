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
    photo_url?: string;  //EK
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
    const [showSamples, setShowSamples] = useState(false); //EK

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
            setShowSamples(false);  // collapse review highlights on every new search - EK
        } catch (e: any) {
            setErr(e.message || "Failed to analyze this place.");
        } finally {
            setLoading(false);
        }
    };

    /* EK */
    const StarRating = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className={styles.starRow}>
                {"★".repeat(fullStars)}
                {halfStar && "☆"}
                {"☆".repeat(emptyStars)}
            </div>
        );
    };
    /* EK */

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

                        {/* STAR RATING */}
                        {place?.rating && (
                            <StarRating rating={place.rating} />
                        )}

                        <p className={styles.placeAddress}>{place?.address}</p>

                        {/* PLACE PHOTO - EK */}
                        {place?.photo_url && (
                            <>
                                <div className={styles.placePhotoWrap}>
                                    <img
                                        src={place.photo_url}
                                        alt={place.name}
                                        className={styles.placePhoto}
                                    />
                                </div>

                                {/* View on Google Maps Button */}
                                <a
                                    href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.mapButton}
                                >
                                    {/* Google-style Pin Icon */}
                                    <svg
                                        className={styles.mapIcon}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 
                                                0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>

                                    View on Google Maps
                                </a>
                            </>
                        )}
                        {/* PLACE PHOTO - EK */}

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
                    {/* {sentiment?.samples?.length ? (
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
                    ) : null} */}
                    {/* Sample Reviews Collapsible - EK */}
                    {sentiment?.samples?.length ? (
                        <section className={styles.sectionBlock}>
                            <div
                                className={styles.sampleToggle}
                                onClick={() => setShowSamples(!showSamples)}
                            >
                                <h3 className={styles.sectionTitle}>
                                    Review Highlights ({sentiment?.samples?.length || 0})
                                </h3>

                                <span className={styles.toggleIcon}>
                                    {showSamples ? "▲ Hide" : "▼ Show"}
                                </span>
                            </div>

                            {showSamples && (
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
                            )}
                        </section>
                    ) : null}
                    {/* Sample Reviews Collapsible - EK */}
                </main>
            )}
        </div>
    );
}
