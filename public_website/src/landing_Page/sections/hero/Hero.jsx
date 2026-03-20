import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../../context/ModalContext';
import { fetchHeroContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import BackgroundAnimation from '../../../Shared/BackgroundAnimation/BackgroundAnimation';
import './hero.css';

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
                <BackgroundAnimation />
                <div className="hero-container">
                    <div className="skeleton skeleton-badge" style={{ margin: '0 auto 24px' }}></div>
                    <div className="skeleton skeleton-title" style={{ height: '120px', width: '80%', margin: '0 auto 24px' }}></div>
                    <div className="skeleton skeleton-subtitle" style={{ height: '48px', width: '60%', margin: '0 auto 40px' }}></div>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <div className="skeleton skeleton-btn"></div>
                        <div className="skeleton skeleton-btn"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !hero) {
        return <ErrorMessage message={error} retry={loadHero} />;
    }

    const clientLogos = (Array.isArray(hero.client_logos) && hero.client_logos.length)
        ? hero.client_logos
        : [];

    return (
        <section className="hero-section">
            <BackgroundAnimation />
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
                                <img src={logo} alt={`Antha Tech Client Partner ${index + 1}`} className="client-brand-logo" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
