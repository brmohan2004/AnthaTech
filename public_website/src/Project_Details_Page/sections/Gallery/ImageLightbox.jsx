import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageLightbox.css';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.4;

const ImageLightbox = ({ src, alt, onClose }) => {
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Drag state (mouse)
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const lastTranslate = useRef({ x: 0, y: 0 });

    // Pinch state (touch)
    const lastPinchDist = useRef(null);
    const lastTouchTranslate = useRef({ x: 0, y: 0 });
    const lastTouchMidpoint = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    // ── Zoom helpers ──────────────────────────────────────────
    const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

    const zoomIn = () => setScale(prev => {
        const next = clampScale(prev + ZOOM_STEP);
        if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
        return next;
    });

    const zoomOut = () => setScale(prev => {
        const next = clampScale(prev - ZOOM_STEP);
        if (next <= MIN_SCALE) { setTranslate({ x: 0, y: 0 }); return MIN_SCALE; }
        return next;
    });

    const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

    // ── Mouse wheel zoom ──────────────────────────────────────
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setScale(prev => {
            const next = clampScale(prev + delta);
            if (next <= MIN_SCALE) setTranslate({ x: 0, y: 0 });
            return next;
        });
    }, []);

    // ── Mouse drag ────────────────────────────────────────────
    const handleMouseDown = (e) => {
        if (scale <= 1) return;
        isDragging.current = true;
        dragStart.current = { x: e.clientX - lastTranslate.current.x, y: e.clientY - lastTranslate.current.y };
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const newTranslate = {
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
        };
        lastTranslate.current = newTranslate;
        setTranslate(newTranslate);
    };

    const handleMouseUp = () => { isDragging.current = false; };

    // ── Pinch-to-zoom (touch) ─────────────────────────────────
    const getPinchDist = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getMidpoint = (touches) => ({
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
    });

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            lastPinchDist.current = getPinchDist(e.touches);
            lastTouchMidpoint.current = getMidpoint(e.touches);
            lastTouchTranslate.current = translate;
        } else if (e.touches.length === 1 && scale > 1) {
            dragStart.current = {
                x: e.touches[0].clientX - lastTranslate.current.x,
                y: e.touches[0].clientY - lastTranslate.current.y,
            };
            isDragging.current = true;
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            isDragging.current = false;
            const dist = getPinchDist(e.touches);
            if (lastPinchDist.current) {
                const ratio = dist / lastPinchDist.current;
                setScale(prev => {
                    const next = clampScale(prev * ratio);
                    if (next <= MIN_SCALE) setTranslate({ x: 0, y: 0 });
                    return next;
                });
            }
            lastPinchDist.current = dist;
        } else if (e.touches.length === 1 && isDragging.current) {
            const newTranslate = {
                x: e.touches[0].clientX - dragStart.current.x,
                y: e.touches[0].clientY - dragStart.current.y,
            };
            lastTranslate.current = newTranslate;
            setTranslate(newTranslate);
        }
    };

    const handleTouchEnd = () => {
        lastPinchDist.current = null;
        isDragging.current = false;
        if (scale <= MIN_SCALE) setTranslate({ x: 0, y: 0 });
    };

    return (
        <div
            className="lightbox-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Controls */}
            <div className="lightbox-controls">
                <button className="lb-btn" onClick={zoomOut} title="Zoom out">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                </button>

                <button className="lb-btn lb-scale-badge" onClick={resetZoom} title="Reset zoom">
                    {Math.round(scale * 100)}%
                </button>

                <button className="lb-btn" onClick={zoomIn} title="Zoom in">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                </button>

                <button className="lb-btn lb-close" onClick={onClose} title="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            {/* Image stage */}
            <div
                className="lightbox-stage"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="lightbox-img"
                    draggable={false}
                    style={{
                        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                        transition: isDragging.current ? 'none' : 'transform 0.15s ease',
                    }}
                />
            </div>

            {/* Hint */}
            {scale === 1 && (
                <p className="lightbox-hint">
                    Scroll or pinch to zoom · Click outside to close
                </p>
            )}
        </div>
    );
};

export default ImageLightbox;
