import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import logo from '../../assets/logo.png';
import { fetchServices, fetchSiteConfig } from '../../api/content';
import { MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
    const [services, setServices] = useState([]);
    const [contact, setContact] = useState({});

    useEffect(() => {
        fetchServices()
            .then(data => {
                if (data?.length) {
                    setServices(data.slice(0, 4)); // Show top 4 services
                }
            })
            .catch(() => { });

        // The original code already correctly parses the JSON string.
        // The instruction seems to imply a change to this block,
        // but the provided "Code Edit" snippet is syntactically incorrect
        // and attempts to move this logic into the fetchServices' then block,
        // which is not ideal for independent fetches.
        // Assuming the intent was to ensure robust parsing and error handling for fetchSiteConfig,
        // the existing implementation is already good.
        // If the intent was to convert it to async/await, it should be done carefully.
        // For now, I will keep the existing, correct parsing logic.
        fetchSiteConfig()
            .then(config => {
                console.log('Site Config fetched in Footer:', config);
                if (config.contact) {
                    const parsed = typeof config.contact === 'string' ? JSON.parse(config.contact) : config.contact;
                    console.log('Parsed contact in Footer:', parsed);
                    setContact(parsed || {});
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

                    {/* Address Column */}
                    <div className="footer-col address-col">
                        <h4 className="footer-heading">Contact Us</h4>
                        <div className="footer-address">
                            <MapPin size={18} className="address-icon" />
                            <p>{contact.address || 'Address not listed'}</p>
                        </div>
                        {contact.mapUrl && (
                            <a 
                                href={contact.mapUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="map-btn"
                            >
                                <ExternalLink size={14} /> View on Map
                            </a>
                        )}
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
