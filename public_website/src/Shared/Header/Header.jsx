import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/logo.webp';
import { useModal } from '../../context/ModalContext';
import { fetchSiteConfig } from '../../api/content';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFloating, setIsFloating] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [config, setConfig] = useState({});
    const { openContactModal } = useModal();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    useEffect(() => {
        fetchSiteConfig()
            .then(data => {
                if (data) setConfig(data);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Handle floating state (past 100px)
            if (currentScrollY > 100) {
                setIsFloating(true);
            } else {
                setIsFloating(false);
            }

            // Handle visibility (show on scroll up, hide on scroll down)
            // Header stays visible until past hero section (approx window.innerHeight)
            const heroHeight = window.innerHeight * 0.8;
            if (currentScrollY > lastScrollY && currentScrollY > heroHeight) {
                // Scrolling down past hero, hide header
                setIsVisible(false);
            } else {
                // Scrolling up or within hero, show header
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`main-header ${isFloating ? 'floating' : ''} ${isVisible ? 'visible' : 'hidden'} ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="header-container">
                <div className="header-logo">
                    <Link to="/" onClick={handleLogoClick}>
                        <img
                            src={logoImg}
                            alt="Antha Tech Logo"
                            width="77"
                            height="60"
                            style={{ objectFit: 'contain' }}
                        />
                    </Link>
                </div>

                <nav className="header-nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <NavLink
                                to="/about"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                About
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/services"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                Services
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/projects"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                Projects
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/insights"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                Insights
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/community"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                Community
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/privacy-policy"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link" || (location.pathname.includes('/privacy') || location.pathname.includes('/terms') || location.pathname.includes('/cookies'))}
                            >
                                Legal
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <ThemeToggle className="desktop-toggle" />
                    <button
                        className="btn-get-in-touch"
                        onClick={openContactModal}
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        {config.header_cta_text || 'Get in Touch'}
                    </button>

                    <button 
                        className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div 
                className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            >
                <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
                    <ul className="mobile-nav-list">
                        <li className="mobile-nav-item">
                            <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
                        </li>
                        <li className="mobile-nav-item">
                            <NavLink to="/services" onClick={() => setIsMenuOpen(false)}>Services</NavLink>
                        </li>
                        <li className="mobile-nav-item">
                            <NavLink to="/projects" onClick={() => setIsMenuOpen(false)}>Projects</NavLink>
                        </li>
                        <li className="mobile-nav-item">
                            <NavLink to="/insights" onClick={() => setIsMenuOpen(false)}>Insights</NavLink>
                        </li>
                        <li className="mobile-nav-item">
                            <NavLink to="/community" onClick={() => setIsMenuOpen(false)}>Community</NavLink>
                        </li>
                        <li className="mobile-nav-item">
                            <NavLink to="/privacy-policy" onClick={() => setIsMenuOpen(false)}>Legal</NavLink>
                        </li>
                        <li className="mobile-nav-item">
                            <ThemeToggle className="mobile-theme-toggle" />
                        </li>
                        <li className="mobile-nav-item mobile-cta-item">
                            <button className="mobile-cta-btn" onClick={() => { setIsMenuOpen(false); openContactModal(); }}>
                                Get in Touch
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
