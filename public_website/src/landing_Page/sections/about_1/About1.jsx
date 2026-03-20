import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../../context/ModalContext';
import { fetchAboutContent } from '../../../api/content';
import ErrorMessage from '../../../Shared/ErrorMessage/ErrorMessage';
import './about1.css';
import logoImg from '../../../assets/logo.webp';

export default function About1() {
    const navigate = useNavigate();
    const { openContactModal } = useModal();

    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAbout = () => {
        setLoading(true);
        setError(null);
        fetchAboutContent('about1')
            .then(data => {
                setAbout(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadAbout();
    }, []);

    if (loading) {
        return (
            <section className="about-section">
                <div className="about-container">
                    <div className="about-loading">Loading Section...</div>
                </div>
            </section>
        );
    }

    if (error || !about) {
        return <ErrorMessage message={error} retry={loadAbout} />;
    }

    const logo = about.logo_url || logoImg;

    return (
        <section className="about-section" id="about">
            <div className="about-container">
                <div className="about-logo-wrapper fade-in-up">
                    <img
                        src={logo}
                        alt="Antha Tech Logo"
                        className="about-logo"
                        loading="lazy"
                    />
                </div>

                {/* First paragraph block */}
                {Array.isArray(about.paragraph_1) && about.paragraph_1.length > 0 ? (
                    <h2 className="about-text-large fade-in-up delay-1">
                        {about.paragraph_1.map((item, i) => (
                            <span key={i} className={(item.color === 'blue' || item.type === 'blue') ? 'text-blue' : 'text-dark'}>
                                {item.text}{' '}
                                {item.br && <br />}
                            </span>
                        ))}
                    </h2>
                ) : (
                    <h2 className="about-text-large fade-in-up delay-1">
                        <span className="text-blue">We’re a</span>{' '}
                        <span className="text-dark">digital design studio</span><br />
                        <span className="text-blue">founded by tech passionate</span><br />
                        <span className="text-blue">enthusiasts.</span>
                    </h2>
                )}

                {/* Second paragraph block */}
                {Array.isArray(about.paragraph_2) && about.paragraph_2.length > 0 ? (
                    <h2 className="about-text-large fade-in-up delay-2">
                        {about.paragraph_2.map((item, i) => (
                            <span key={i} className={(item.color === 'blue' || item.type === 'blue') ? 'text-blue' : 'text-dark'}>
                                {item.text}{' '}
                                {item.br && <br />}
                            </span>
                        ))}
                    </h2>
                ) : (
                    <h2 className="about-text-large fade-in-up delay-2">
                        <span className="text-blue">We create</span>{' '}
                        <span className="text-dark">memorable websites,</span><br />
                        <span className="text-dark">user interfaces</span>{' '}
                        <span className="text-blue">and</span>{' '}
                        <span className="text-dark">mobile apps</span><br />
                        <span className="text-blue">that</span>{' '}
                        <span className="text-dark">redefine</span>{' '}
                        <span className="text-blue">how people</span>{' '}
                        <span className="text-dark">connect</span><br />
                        <span className="text-blue">with the</span>{' '}
                        <span className="text-dark">digital world.</span>
                    </h2>
                )}

                <div className="about-buttons-wrapper fade-in-up delay-3">
                    <button className="btn-dark-blue" onClick={() => {
                        const txt = (about.btn_primary || '').toLowerCase();
                        if (txt.includes('about')) navigate('/about');
                        else if (txt.includes('service')) navigate('/services');
                        else openContactModal();
                    }}>{about.btn_primary}</button>
                    <button className="btn-white" onClick={() => {
                        const txt = (about.btn_secondary || '').toLowerCase();
                        if (txt.includes('about')) navigate('/about');
                        else if (txt.includes('service')) navigate('/services');
                        else navigate('/about'); // default fallback
                    }}>{about.btn_secondary}</button>
                </div>
            </div>
        </section>
    );
}
