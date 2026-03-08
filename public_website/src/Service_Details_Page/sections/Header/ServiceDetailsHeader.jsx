import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceDetailsHeader.css';
import { useModal } from '../../../context/ModalContext';

const ServiceDetailsHeader = () => {
    const navigate = useNavigate();
    const { openContactModal } = useModal();

    return (
        <header className="service-details-header">
            <button
                className="back-button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <button
                className="get-in-touch-btn"
                onClick={openContactModal}
                style={{ border: 'none', cursor: 'pointer', background: 'none' }}
            >
                Get in touch
            </button>
        </header>
    );
};

export default ServiceDetailsHeader;
