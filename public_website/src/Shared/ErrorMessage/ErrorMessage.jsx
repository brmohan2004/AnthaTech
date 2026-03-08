import React from 'react';
import { AlertCircle } from 'lucide-react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, retry }) => {
    return (
        <div className="error-message-container">
            <div className="error-content">
                <AlertCircle className="error-icon" size={48} />
                <h3 className="error-title">Something went wrong</h3>
                <p className="error-text">
                    {message || "We couldn't load this section. Please try again later."}
                </p>
                {retry && (
                    <button className="error-retry-btn" onClick={retry}>
                        Retry Loading
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
