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

    // Extract translation + pronunciation (if exists) //EK
    const extractPronunciation = (text: string) => {
        const match = text.match(/^(.*)\((.*)\)$/);
        if (!match) {
            return {
                translated: text.trim(),
                pronunciation: null
            };
        }
        return {
            translated: match[1].trim(),
            pronunciation: match[2].trim()
        };
    };

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
                    source_lang: sourceLang,
                    target_lang: targetLang,
                    tone,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `Translation failed (${res.status})`);
            }

            const json: TranslateResponse = await res.json();
            const cleaned = json.reply.replace(/\*\*/g, ""); //// Remove ** Markdown bold markers
            setTranslatedText(cleaned);
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

    const cleanForTTS = (text: string) => {
        if (!text) return "";

        return text
            .replace(/\*\*/g, "")          // remove Markdown bold
            .replace(/\u200B/g, "")        // remove zero-width spaces
            .replace(/[”“]/g, '"')         // replace fancy quotes
            .replace(/[’]/g, "'")          // replace apostrophes
            .trim();
    };


    const handleSpeak = (text: string) => {
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        //utterance.lang = "my-MM";  // Burmese voice if available
        utterance.rate = 0.85;     // little slowe  r for clarity
        speechSynthesis.speak(utterance);
    };


    // const prettyLang = (lang: string) =>
    //     lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : lang;
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
                    Your AI-powered travel translator - convert messages between languages with your preferred tone.
                </p>
            </header>

            {/* <header className={styles.header}>
                <h1 className={styles.title}>Language Buddy</h1>
                <p className={styles.subtitle}>
                    Translate your message between any two supported languages with the tone you choose.
                </p>
            </header> */}


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
                                    // <option key={lang} value={lang}>
                                    //     {lang}
                                    // </option>
                                    <option key={lang} value={lang}>
                                        {prettyLang(lang)}
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
                                    // <option key={lang} value={lang}>
                                    //     {lang}
                                    // </option>
                                    <option key={lang} value={lang}>
                                        {prettyLang(lang)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* === MESSAGE TEXTAREA BELOW === */}
                    <div className={styles.messageField}>
                        <label className={styles.label}>Your message</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Type your message…"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                        />
                    </div>


                    {/* <div className={styles.formRow}>
                        <label className={styles.label}>
                            Your message
                            <textarea
                                className={styles.textarea}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                            />
                        </label>
                    </div> */}


                    {/* === TONE BELOW MESSAGE === */}
                    <div className={styles.formRow}>
                        <label className={styles.label}>Tone</label>

                        <select
                            className={styles.select}
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                        >
                            <option value="polite">Polite 🙂</option>
                            <option value="formal">Formal 🧑‍💼</option>
                            <option value="casual">Casual 😎</option>
                        </select>
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
            {translatedText && (() => {
                const { translated, pronunciation } = extractPronunciation(translatedText);

                return (
                    <section className={styles.card}>
                        <h2 className={styles.resultTitle}>Translation Result</h2>

                        <div className={styles.sideBySide}>

                            {/* Left: Original message */}
                            <div className={styles.column}>
                                <h3 className={styles.colHeader}>
                                    Your Message ({prettyLang(sourceLang)})
                                </h3>
                                <p className={styles.colText}>{message}</p>
                            </div>

                            {/* Right: Translated with pronunciation */}
                            <div className={styles.column}>
                                <h3 className={styles.colHeader}>
                                    Translated ({prettyLang(targetLang)} • {prettyLang(tone)})
                                </h3>
                                <p className={styles.colText}>{translated}</p>

                                <div className={styles.speakContainer}>
                                    {pronunciation && (
                                        <p className={styles.pronunciation}>
                                            <strong>Pronunciation:</strong> {pronunciation}
                                        </p>
                                    )}

                                    {/* <button
                                        type="button"
                                        className={styles.speakButton}
                                        onClick={() => handleSpeak(pronunciation || translated)}
                                    >
                                        🔊 Speak
                                    </button> */}
                                </div>


                            </div>

                        </div>
                    </section>
                );
            })()}



        </div>
    );
}
