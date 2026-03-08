import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import './ToastMessage.css';

const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
};

const ToastMessage = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (type !== 'error') {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [type, duration, onClose]);

    if (!visible) return null;

    return (
        <div className={`toast toast--${type}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-text">{message}</span>
            <button className="toast-close" onClick={() => { setVisible(false); if (onClose) onClose(); }}>
                <X size={14} />
            </button>
        </div>
    );
};

export default ToastMessage;
