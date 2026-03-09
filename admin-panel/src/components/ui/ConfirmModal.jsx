import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({
    isOpen = false,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'danger',
    requireTyping = false,
    typeConfirmWord = 'DELETE',
    onConfirm,
    onCancel,
    icon,
}) => {
    const [typedValue, setTypedValue] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTypedValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isConfirmDisabled = requireTyping && typedValue !== typeConfirmWord;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon-wrapper">
                    {icon || <AlertTriangle size={28} />}
                </div>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>

                {requireTyping && (
                    <div className="modal-type-confirm">
                        <label>Type <strong>{typeConfirmWord}</strong> to confirm:</label>
                        <input
                            type="text"
                            className="modal-type-input"
                            value={typedValue}
                            onChange={(e) => setTypedValue(e.target.value)}
                            placeholder={typeConfirmWord}
                            autoFocus
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <button className="modal-btn modal-btn--cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`modal-btn modal-btn--${variant}`}
                        onClick={onConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
