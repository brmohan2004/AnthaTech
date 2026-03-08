import React from 'react';
import './Challenges.css';

const Challenges = ({ project }) => {
    const challenges = Array.isArray(project?.challenges) ? project.challenges : [];
    const fallbackText = [
        'RecruiterOne approached us with the challenge of establishing a strong digital presence that would resonate with Romanian entrepreneurs while also streamlining their recruitment processes.',
        'The task at hand was to create a platform that not only showcased their services but also integrated effortlessly with social networks to enhance their recruitment capabilities.',
    ];
    const paragraphs = challenges.length ? challenges : fallbackText;
    return (
        <section className="pd-challenges-section">
            <div className="pd-challenges-container">
                <div className="pd-challenges-icon">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 0L53.5 35.5L85.5 14.5L64.5 46.5L100 50L64.5 53.5L85.5 85.5L53.5 64.5L50 100L46.5 64.5L14.5 85.5L35.5 53.5L0 50L35.5 46.5L14.5 14.5L46.5 35.5L50 0Z" fill="url(#paint0_linear)" />
                        <defs>
                            <linearGradient id="paint0_linear" x1="14.5" y1="14.5" x2="85.5" y2="85.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FCD34D" />
                                <stop offset="0.5" stopColor="#F59E0B" />
                                <stop offset="1" stopColor="#D97706" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h2 className="pd-challenges-title">Challenges</h2>
                <div className="pd-challenges-text">
                    {paragraphs.map((text, i) => (
                        <p key={i}>{text}</p>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Challenges;
