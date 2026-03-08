import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import './ContentPreview.css';

const breakpoints = [
    { id: 'desktop', label: 'Desktop', width: '1440px', icon: <Monitor size={16} /> },
    { id: 'tablet', label: 'Tablet', width: '768px', icon: <Tablet size={16} /> },
    { id: 'mobile', label: 'Mobile', width: '390px', icon: <Smartphone size={16} /> },
];

const PREVIEW_DURATION = 15 * 60; // 15 minutes in seconds

const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const ContentPreview = ({ previewUrl = 'https://www.anthatech.com' }) => {
    const [activeBreakpoint, setActiveBreakpoint] = useState('desktop');
    const [token, setToken] = useState(generateToken);
    const [secondsLeft, setSecondsLeft] = useState(PREVIEW_DURATION);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const refreshToken = useCallback(() => {
        setToken(generateToken());
        setSecondsLeft(PREVIEW_DURATION);
    }, []);

    const expired = secondsLeft <= 0;
    const minutes = Math.floor(Math.max(0, secondsLeft) / 60);
    const seconds = Math.max(0, secondsLeft) % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const currentBp = breakpoints.find(b => b.id === activeBreakpoint);
    const fullUrl = `${previewUrl}?preview_token=${token}`;

    return (
        <div className="content-preview">
            <div className="preview-toolbar">
                <div className="preview-tabs">
                    {breakpoints.map(bp => (
                        <button
                            key={bp.id}
                            className={`preview-tab ${activeBreakpoint === bp.id ? 'preview-tab--active' : ''}`}
                            onClick={() => setActiveBreakpoint(bp.id)}
                        >
                            {bp.icon}
                            <span>{bp.label}</span>
                        </button>
                    ))}
                </div>
                <a
                    className="preview-open-btn"
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <ExternalLink size={14} /> Open in New Tab
                </a>
            </div>

            <div className="preview-viewport">
                {expired ? (
                    <div className="preview-expired">
                        <p>Preview token has expired.</p>
                        <button className="preview-refresh-btn" onClick={refreshToken}>
                            <RefreshCw size={14} /> Generate New Token
                        </button>
                    </div>
                ) : (
                    <div className="preview-frame-wrapper" style={{ maxWidth: currentBp.width }}>
                        <iframe
                            className="preview-iframe"
                            src={fullUrl}
                            title="Content Preview"
                        />
                    </div>
                )}
            </div>

            <div className="preview-footer">
                <span className={`preview-timer ${expired ? 'preview-timer--expired' : ''}`}>
                    {expired
                        ? '⚠ Token expired'
                        : <>⏱ Expires in: <strong>{timeStr}</strong></>
                    }
                </span>
                <button className="preview-refresh-btn" onClick={refreshToken}>
                    <RefreshCw size={14} /> Get Fresh Token
                </button>
            </div>
        </div>
    );
};

export default ContentPreview;
