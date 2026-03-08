import React, { useState, useEffect } from "react";
import { fetchHighlightsContent } from "../../../api/content";
import ErrorMessage from "../../../Shared/ErrorMessage/ErrorMessage";
import "./highlights.css";

const DEFAULT_HIGHLIGHTS = [
    {
        title: "Integrated\nExpertise",
        icon: (
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="42" cy="42" r="12" fill="#F05A63" />
                <path d="M42 30C42 30 52 10 72 20C72 20 62 40 42 42V30Z" fill="url(#grad1)" opacity="0.8" />
                <path d="M54 42C54 42 74 52 64 72C64 72 44 62 42 42H54Z" fill="url(#grad1)" opacity="0.8" />
                <path d="M42 54C42 54 32 74 12 64C12 64 22 44 42 42V54Z" fill="url(#grad1)" opacity="0.8" />
                <path d="M30 42C30 42 10 32 20 12C20 12 40 22 42 42H30Z" fill="url(#grad1)" opacity="0.8" />
                <defs>
                    <linearGradient id="grad1" x1="12" y1="12" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F05A63" />
                        <stop offset="1" stopColor="#FF8E94" />
                    </linearGradient>
                </defs>
            </svg>
        ),
    },
    {
        title: "Creative\nExcellence",
        icon: (
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42 10C59.6731 10 74 24.3269 74 42C74 59.6731 59.6731 74 42 74C24.3269 74 10 59.6731 10 42C10 24.3269 24.3269 10 42 10Z" stroke="url(#grad2)" strokeWidth="12" strokeLinecap="round" strokeDasharray="50 150" />
                <path d="M42 10C59.6731 10 74 24.3269 74 42C74 59.6731 59.6731 74 42 74C24.3269 74 10 59.6731 10 42C10 24.3269 24.3269 10 42 10Z" stroke="url(#grad2)" strokeWidth="12" strokeLinecap="round" strokeDasharray="50 150" strokeDashoffset="-100" />
                <defs>
                    <linearGradient id="grad2" x1="10" y1="10" x2="74" y2="74" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4ADE80" />
                        <stop offset="1" stopColor="#2DD4BF" />
                    </linearGradient>
                </defs>
            </svg>
        ),
    },
    {
        title: "Open\nCommunication",
        icon: (
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="42" r="20" fill="url(#grad3)" opacity="0.3" />
                <circle cx="42" cy="42" r="20" fill="url(#grad3)" opacity="0.6" />
                <circle cx="54" cy="42" r="20" fill="url(#grad3)" />
                <defs>
                    <linearGradient id="grad3" x1="10" y1="42" x2="74" y2="42" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF8E94" />
                        <stop offset="1" stopColor="#F05A63" />
                    </linearGradient>
                </defs>
            </svg>
        ),
    },
    {
        title: "Customised\nSolutions",
        icon: (
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 22L62 62" stroke="url(#grad4)" strokeWidth="14" strokeLinecap="round" />
                <path d="M62 22L22 62" stroke="url(#grad4)" strokeWidth="14" strokeLinecap="round" />
                <defs>
                    <linearGradient id="grad4" x1="22" y1="22" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#60A5FA" />
                        <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                </defs>
            </svg>
        ),
    },
];

export default function Highlights() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHighlights = () => {
        setLoading(true);
        setError(null);
        fetchHighlightsContent()
            .then(data => {
                if (data) {
                    setContent(data);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadHighlights();
    }, []);

    if (loading) {
        return (
            <section className="highlights-section" id="highlights">
                <div className="highlights-container">
                    <div className="highlights-loading">Loading Highlights...</div>
                </div>
            </section>
        );
    }

    if (error || !content) {
        return <ErrorMessage message={error} retry={loadHighlights} />;
    }

    const highlights = (Array.isArray(content.items) && content.items.length > 0)
        ? content.items.map((item, i) => ({
            title: item.title || DEFAULT_HIGHLIGHTS[i]?.title || '',
            icon: item.icon_url ? <img src={item.icon_url} alt={item.title} style={{ width: 84, height: 84 }} /> : DEFAULT_HIGHLIGHTS[i]?.icon
        }))
        : DEFAULT_HIGHLIGHTS;

    return (
        <section className="highlights-section" id="highlights">
            <div className="highlights-container">
                {/* Large Text Header */}
                <h2 className="highlights-header fade-in-up">
                    {Array.isArray(content.header_rich_text) && content.header_rich_text.length > 0 ? (
                        content.header_rich_text.map((part, i) => (
                            <span key={i} className={part.type === 'highlight' ? 'text-highlight' : ''}>
                                {part.text}{' '}
                            </span>
                        ))
                    ) : (
                        <React.Fragment>
                            <span className="text-highlight">We blend</span> cutting-edge technology
                            with strategic design <span className="text-highlight">to build</span>{" "}
                            memorable online identities <span className="text-highlight">that</span>{" "}
                            capture hearts <span className="text-highlight">and</span> drive growth.
                        </React.Fragment>
                    )}
                </h2>

                {/* Highlights Grid */}
                <div className="highlights-grid fade-in-up delay-1">
                    {highlights.map((item, index) => (
                        <div className="highlight-item" key={index}>
                            <div className="highlight-icon">{item.icon}</div>
                            <h3 className="highlight-title">
                                {item.title.split("\n").map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i === 0 && <br />}
                                    </React.Fragment>
                                ))}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
