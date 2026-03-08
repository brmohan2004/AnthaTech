import React from 'react';
import './Button.css';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    onClick,
    type = 'button',
    fullWidth = false,
    ...props
}) => {
    return (
        <button
            type={type}
            className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''}`}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <Loader2 size={16} className="btn-spinner" />
            ) : icon ? (
                <span className="btn-icon">{icon}</span>
            ) : null}
            <span>{children}</span>
        </button>
    );
};

export default Button;
