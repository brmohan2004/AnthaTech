import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/logo.png';
import { useModal } from '../../context/ModalContext';
import { fetchSiteConfig } from '../../api/content';

const Header = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFloating, setIsFloating] = useState(false);
    const [showGetInTouch, setShowGetInTouch] = useState(true); // Default true for desktop
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [config, setConfig] = useState({});
    const { openContactModal } = useModal();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMenuOpen(false);
                setShowGetInTouch(true);
            } else {
                // Initial state for mobile
                setShowGetInTouch(window.scrollY > 400); 
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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

            // Get in touch button visibility logic for mobile
            if (isMobile) {
                // Approximate position of "They trusted us"
                // Usually hero is about 80vh-100vh. Let's use 400px as a trigger
                if (currentScrollY > 400) {
                    setShowGetInTouch(true);
                } else {
                    setShowGetInTouch(false);
                }
            } else {
                setShowGetInTouch(true);
            }

            // Handle visibility (show on scroll up, hide on scroll down)
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                // Scrolling down, hide header
                setIsVisible(false);
                setIsMenuOpen(false); // Close menu on scroll down
            } else {
                // Scrolling up, show header
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>
            {isMobile && isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
            <header className={`main-header ${isFloating ? 'floating' : ''} ${isVisible ? 'visible' : 'hidden'} ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="header-container">
                <div className="header-logo">
                    <Link to="/" onClick={(e) => { handleLogoClick(e); setIsMenuOpen(false); }}>
                        <img
                            src={logoImg}
                            alt="Antha Tech Logo"
                            className="logo-img"
                            style={{ objectFit: 'contain' }}
                        />
                    </Link>
                </div>

                <nav className={`header-nav ${isMenuOpen ? 'mobile-visible' : ''}`}>
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
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Community
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    {showGetInTouch && (
                        <button
                            className="btn-get-in-touch"
                            onClick={() => { openContactModal(); setIsMenuOpen(false); }}
                            style={{ border: 'none', cursor: 'pointer' }}
                        >
                            {config.header_cta_text || 'Get in Touch'}
                        </button>
                    )}

                    <button
                        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
        </>
    );
};

export default Header;
