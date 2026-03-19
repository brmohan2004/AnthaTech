import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../../context/ModalContext';
import { fetchHeroContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import './hero.css';
import client1 from '../../../assets/client_1.png';
import client2 from '../../../assets/client_2.png';
import client3 from '../../../assets/client_3.png';
import client4 from '../../../assets/client_4.png';
import client5 from '../../../assets/client_5.png';
import client6 from '../../../assets/client_6.png';

const LOCAL_LOGOS = [client1, client2, client3, client4, client5, client6];

export default function Hero() {
    const navigate = useNavigate();
    const { openContactModal } = useModal();

    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadHero = () => {
        setLoading(true);
        setError(null);
        fetchHeroContent()
            .then(data => {
                setHero(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        let isMounted = true;
        fetchHeroContent()
            .then(data => {
                if (isMounted && data) {
                    setHero(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            });
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-loading">Loading hero section...</div>
                </div>
            </section>
        );
    }

    if (error || !hero) {
        return <ErrorMessage message={error} retry={loadHero} />;
    }

    const clientLogos = (Array.isArray(hero.client_logos) && hero.client_logos.length)
        ? hero.client_logos
        : LOCAL_LOGOS;

    return (
        <section className="hero-section">
            <div className="hero-shadow-overlay"></div>

            <div className="hero-container">
                <div className="hero-badge fade-in-up">
                    <span className="badge-text">{hero.badge_text}</span>
                </div>

                <h1 className="hero-title fade-in-up delay-1">
                    {hero.title_line_1} <br />
                    <span className="text-gradient">{hero.title_line_2}</span>
                </h1>

                <p className="hero-subtitle fade-in-up delay-2">
                    {hero.subtitle_1}<br />
                    {hero.subtitle_2}
                </p>

                <div className="hero-cta-group fade-in-up delay-3">
                    <button onClick={() => navigate(hero.cta_primary_route)} className="btn btn-primary">{hero.cta_primary_text}</button>
                    <button onClick={openContactModal} className="btn btn-secondary" style={{ border: 'none', cursor: 'pointer' }}>{hero.cta_secondary_text}</button>
                </div>
            </div>

            <div className="hero-trusted fade-in-up delay-4">
                <p className="trusted-label">They trusted us</p>
                <div className="logo-carousel-container">
                    <div className="carousel-edge-blur left"></div>
                    <div className="carousel-edge-blur right"></div>

                    <div className="logo-track">
                        {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, index) => (
                            <div key={index} className="client-logo-item">
                                <img src={logo} alt={`Client ${index}`} className="client-brand-logo" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
