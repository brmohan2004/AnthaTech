import React from 'react';
import './progressCard.css';

export default function ProgressCard({ title, description, activeIndex, index, total, image }) {
    const diff = index - activeIndex;
    const isPassed = diff < 0;
    const isActive = diff === 0;

    const isMobile = window.innerWidth <= 768;
    const shiftAmount = isMobile ? 30 : 120;

    let translateX = diff * shiftAmount;
    let scale = 1 - (Math.abs(diff) * 0.04);
    let opacity = 1;

    if (isPassed) {
        translateX = -1500; // Move far left to hide instead of fading
        scale = 0.9;
    }

    return (
        <div
            className={`progress-card ${isActive ? 'active' : ''}`}
            style={{
                zIndex: total - index,
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity: Math.max(0, opacity),
                pointerEvents: isActive ? 'auto' : 'none'
            }}
        >
            <div className="progress-card-content">
                <h3 className="progress-card-title">{title}</h3>
                <p className="progress-card-description">{description}</p>
            </div>
            {image && (
                <div className="progress-card-image">
                    <img src={image} alt={title} loading="lazy" />
                </div>
            )}
        </div>
    );
}
