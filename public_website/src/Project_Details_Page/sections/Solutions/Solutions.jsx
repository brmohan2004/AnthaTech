import React from 'react';
import './Solutions.css';

const Solutions = ({ project }) => {
    const solutions = Array.isArray(project?.solutions) ? project.solutions : [];
    const fallbackText = [
        'We developed a comprehensive digital strategy for RecruiterOne, creating an engaging website (designed by Tudor Dobritoiu) that showcased their value proposition and role as strategic partners. We also built an user friendly platform with social network integration, particularly LinkedIn, to streamline recruitment processes.',
        "Our tailored solutions transformed RecruiterOne's digital presence into a powerful tool for attracting clients and candidates. This new digital ecosystem positions RecruiterOne as a forward-thinking leader in Romania's recruitment sector, better equipped to support entrepreneurs in finding top talent.",
    ];
    const paragraphs = solutions.length ? solutions : fallbackText;
    return (
        <section className="pd-solutions-section">
            <div className="pd-solutions-container">
                <div className="pd-solutions-icon">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="50" y="10" width="28" height="28" rx="6" transform="rotate(45 50 10)" fill="url(#paint0_linear)" />
                        <rect x="75" y="35" width="28" height="28" rx="6" transform="rotate(45 75 35)" fill="url(#paint1_linear)" />
                        <rect x="25" y="35" width="28" height="28" rx="6" transform="rotate(45 25 35)" fill="url(#paint2_linear)" />
                        <rect x="50" y="60" width="28" height="28" rx="6" transform="rotate(45 50 60)" fill="url(#paint3_linear)" />
                        <defs>
                            <linearGradient id="paint0_linear" x1="50" y1="10" x2="78" y2="38" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#86EFAC" />
                                <stop offset="1" stopColor="#4ADE80" />
                            </linearGradient>
                            <linearGradient id="paint1_linear" x1="75" y1="35" x2="103" y2="63" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#BEF264" />
                                <stop offset="1" stopColor="#A3E635" />
                            </linearGradient>
                            <linearGradient id="paint2_linear" x1="25" y1="35" x2="53" y2="63" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#BEF264" />
                                <stop offset="1" stopColor="#A3E635" />
                            </linearGradient>
                            <linearGradient id="paint3_linear" x1="50" y1="60" x2="78" y2="88" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A3E635" />
                                <stop offset="1" stopColor="#4ADE80" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h2 className="pd-solutions-title">Solutions</h2>
                <div className="pd-solutions-text">
                    {paragraphs.map((text, i) => (
                        <p key={i}>{text}</p>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Solutions;
