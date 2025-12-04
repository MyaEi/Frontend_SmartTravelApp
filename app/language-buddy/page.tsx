"use client";

import React, { useEffect, useState } from "react";
import styles from "./language-buddy.module.css";
import { useRouter } from "next/navigation";

type LanguagesResponse = {
    supported_languages: string[];
};

type TranslateResponse = {
    reply: string;
};

export default function LanguageBuddyPage() {
    const router = useRouter();
    const [languages, setLanguages] = useState<string[]>([]);
    const [loadingLangs, setLoadingLangs] = useState(false);
    const [langsError, setLangsError] = useState<string | null>(null);

    const [message, setMessage] = useState("");

    // NEW: source + target
    const [sourceLang, setSourceLang] = useState<string>("english");
    const [targetLang, setTargetLang] = useState<string>();

    const [tone, setTone] = useState<string>("polite");

    const [loadingTranslate, setLoadingTranslate] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);
    const [translatedText, setTranslatedText] = useState<string | null>(null);

    // Load supported languages on mount
    useEffect(() => {
        let cancelled = false;

        const fetchLanguages = async () => {
            setLoadingLangs(true);
            setLangsError(null);

            try {
                const res = await fetch("/api/chat/languages");
                if (!res.ok) {
                    const msg = await res.text();
                    throw new Error(msg || `Failed to load languages (${res.status})`);
                }
                const json: LanguagesResponse = await res.json();
                if (cancelled) return;

                const langs = json.supported_languages || [];
                setLanguages(langs);

                let src = "english";
                let tgt = "english";

                if (!langs.includes(src) && langs.length) src = langs[0];
                if (!langs.includes(tgt) && langs.length) tgt = langs[0];

                setSourceLang(src);
                setTargetLang(tgt);
            } catch (e: any) {
                if (!cancelled) {
                    setLangsError(e.message || "Failed to load supported languages.");
                }
            } finally {
                if (!cancelled) setLoadingLangs(false);
            }
        };

        fetchLanguages();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleTranslate = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = message.trim();
        if (!trimmed) {
            setTranslateError("Please enter a message to translate.");
            setTranslatedText(null);
            return;
        }
        if (!sourceLang || !targetLang) {
            setTranslateError("Please select both source and target languages.");
            setTranslatedText(null);
            return;
        }

        setLoadingTranslate(true);
        setTranslateError(null);
        setTranslatedText(null);

        try {
            const res = await fetch("/api/chat/language", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    mode: "translate",
                    source_lang: sourceLang,   // 👈 now dynamic
                    target_lang: targetLang,   // 👈 now dynamic
                    tone,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Translation failed (${res.status})`);
            }

            const json: TranslateResponse = await res.json();
            setTranslatedText(json.reply);
        } catch (e: any) {
            setTranslateError(e.message || "Translation failed.");
        } finally {
            setLoadingTranslate(false);
        }
    };

    const handleCopy = () => {
        if (!translatedText) return;
        navigator.clipboard.writeText(translatedText).catch(() => {
            // ignore
        });
    };

    // NEW: swap source & target
    const handleSwapLanguages = () => {
        setSourceLang((prevSource) => {
            const prevTarget = targetLang;
            setTargetLang(prevSource);
            return prevTarget;
        });
    };

    const prettyLang = (lang: string) =>
        lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : lang;

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
                <h1 className={styles.title}>Language Buddy</h1>
                <p className={styles.subtitle}>
                    Translate your message between any two supported languages with the tone you choose.
                </p>
            </header>

            {/* Input / controls */}
            <section className={styles.card}>
                <form onSubmit={handleTranslate} className={styles.form}>
                    {/* === LANGUAGE ROW (From | Swap | To) === */}
                    <div className={styles.langRow}>
                        {/* From */}
                        <div className={styles.langField}>
                            <label className={styles.label}>From</label>
                            <select
                                className={styles.select}
                                value={sourceLang}
                                onChange={(e) => setSourceLang(e.target.value)}
                            >
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Swap */}
                        <button
                            type="button"
                            className={styles.swapBtn}
                            onClick={handleSwapLanguages}
                            aria-label="Swap languages"
                        >
                            ⇄
                        </button>

                        {/* To */}
                        <div className={styles.langField}>
                            <label className={styles.label}>To</label>
                            <select
                                className={styles.select}
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                            >
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* === MESSAGE TEXTAREA BELOW === */}
                    <div className={styles.formRow}>
                        <label className={styles.label}>
                            Your message
                            <textarea
                                className={styles.textarea}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                            />
                        </label>
                    </div>

                    {/* === TONE BELOW MESSAGE === */}
                    <div className={styles.formRow}>
                        <label className={styles.label}>
                            Tone
                            <select
                                className={styles.select}
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <option value="polite">Polite</option>
                                <option value="formal">Formal</option>
                                <option value="casual">Casual</option>
                            </select>
                        </label>
                    </div>

                    {/* Button + hint */}
                    <div className={styles.actionsRow}>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={loadingTranslate}
                        >
                            {loadingTranslate ? "Translating…" : "Translate"}
                        </button>

                        <span className={styles.sourceHint}>
                            {prettyLang(sourceLang)} → {prettyLang(targetLang)} • Tone: {prettyLang(tone)}
                        </span>
                    </div>

                    {translateError && (
                        <p className={styles.errorText}>{translateError}</p>
                    )}
                </form>
            </section>


            {/* Result */}
            {translatedText && (
                <section className={styles.card}>
                    <div className={styles.resultHeader}>
                        <div>
                            <h2 className={styles.resultTitle}>Translated message</h2>
                            <p className={styles.resultMeta}>
                                {prettyLang(sourceLang)} → {prettyLang(targetLang)} ·{" "}
                                {prettyLang(tone)} tone
                            </p>
                        </div>
                        <button
                            type="button"
                            className={styles.ghostButton}
                            onClick={handleCopy}
                        >
                            Copy
                        </button>
                    </div>

                    <div className={styles.resultBody}>
                        <p className={styles.resultText}>{translatedText}</p>
                    </div>
                </section>
            )}
        </div>
    );
}
