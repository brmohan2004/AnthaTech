import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import logo from '../../assets/logo.png';
import { fetchServices } from '../../api/content';

export default function Footer() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetchServices()
            .then(data => {
                if (data?.length) {
                    setServices(data.slice(0, 4)); // Show top 4 services
                }
            })
            .catch(() => { });
    }, []);

    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-top">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <div className="footer-logo">
                            <img src={logo} alt="ANTHA Tech Logo" className="logo-img" />
                            <span className="logo-subtext">by QYNTA</span>
                        </div>
                    </div>

                    {/* Menu Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Menu</h4>
                        <ul className="footer-links">
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/projects">Projects</Link></li>
                            <li><Link to="/services">Services</Link></li>
                            <li><Link to="/insights">Insights</Link></li>
                            <li><Link to="/community">Community</Link></li>
                        </ul>
                    </div>

                    {/* Services Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Services</h4>
                        <ul className="footer-links">
                            <li><Link to="/services">Overview</Link></li>
                            {services.map(s => (
                                <li key={s.slug}>
                                    <Link to={`/service/${s.slug}`}>{s.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#conditions">Conditions</a></li>
                            <li><a href="#cookies">Cookies Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">All Rights reserved by ANTHA Tech @ {new Date().getFullYear()}</p>
                </div>

                <div className="footer-brand-display">
                    <h1>Qynta</h1>
                </div>
            </div>
        </footer>
    );
}
