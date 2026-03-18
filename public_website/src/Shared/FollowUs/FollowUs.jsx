import React, { useState, useEffect } from 'react';
import './followUs.css';
import { fetchSiteConfig } from '../../api/content';
import { Instagram, Linkedin, Twitter, Github, Globe, Facebook, Youtube } from 'lucide-react';
// Note: Behance doesn't have a direct Lucide icon, using Globe as fallback or custom SVG

export default function FollowUs() {
    const [isOpen, setIsOpen] = useState(false);
    const [socialLinks, setSocialLinks] = useState({});

    useEffect(() => {
        (async () => {
            try {
                const config = await fetchSiteConfig();
                if (config.social) {
                    const parsedSocial = typeof config.social === 'string' ? JSON.parse(config.social) : config.social;
                    setSocialLinks(parsedSocial || {}); // Ensure it's always an object
                }
            } catch (err) {
                console.error('Failed to load social links', err);
            }
        })();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const links = [
        { key: 'linkedin', icon: <Linkedin size={18} />, url: socialLinks.linkedin, className: 'linkedin' },
        { key: 'instagram', icon: <Instagram size={18} />, url: socialLinks.instagram, className: 'instagram' },
        { key: 'twitter', icon: <Twitter size={18} />, url: socialLinks.twitter, className: 'twitter' },
        { key: 'github', icon: <Github size={18} />, url: socialLinks.github, className: 'github' },
        { key: 'facebook', icon: <Facebook size={18} />, url: socialLinks.facebook, className: 'facebook' },
        { key: 'youtube', icon: <Youtube size={18} />, url: socialLinks.youtube, className: 'youtube' },
        {
            key: 'behance',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h3s1 0 1-1V9s0-1-1-1H9v4z" />
                    <path d="M4 8v8h5s2 0 2-2V9s0-2-2-2H4z" />
                    <path d="M13 16h5" />
                    <path d="M15 12h3" />
                </svg>
            ),
            url: socialLinks.behance,
            className: 'behance'
        },
    ].filter(link => link.url && link.url.trim() !== '');

    if (links.length === 0) return null;

    return (
        <div className={`follow-us-container ${isOpen ? 'open' : ''}`}>
            {/* Social Icons (Visible when open) */}
            <div className="social-links-wrapper">
                {links.map((link) => (
                    <a
                        key={link.key}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`social-icon-btn ${link.className}`}
                    >
                        {link.icon}
                    </a>
                ))}
            </div>

            {/* Main Toggle Button */}
            <button className="follow-us-toggle" onClick={toggleMenu} aria-label="Toggle Social Links">
                <div className="toggle-icon">
                    {isOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    )}
                </div>
            </button>
        </div>
    );
}
