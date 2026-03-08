import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import logoImg from '../../assets/logo.png';
import { useModal } from '../../context/ModalContext';
import { fetchSiteConfig } from '../../api/content';

const Header = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFloating, setIsFloating] = useState(false);
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

            // Handle visibility (show on scroll up, hide on scroll down)
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                // Scrolling down, hide header
                setIsVisible(false);
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
        <header className={`main-header ${isFloating ? 'floating' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
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
                    </ul>
                </nav>

                <div className="header-actions">
                    <button
                        className="btn-get-in-touch"
                        onClick={openContactModal}
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        {config.header_cta_text || 'Get in Touch'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
