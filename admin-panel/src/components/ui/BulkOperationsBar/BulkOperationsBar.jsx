import React, { useState } from 'react';
import './BulkOperationsBar.css';
import { X, Trash2, CheckCircle, FileX, Mail } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

const BulkOperationsBar = ({
    selectedCount = 0,
    itemType = 'items',
    onPublish,
    onDraft,
    onDelete,
    onMarkRead,
    onClear,
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [typedValue, setTypedValue] = useState('');

    if (selectedCount === 0) return null;

    const handleDeleteConfirm = () => {
        onDelete?.();
        setShowDeleteModal(false);
        setTypedValue('');
    };

    const isMessages = itemType === 'messages';

    return (
        <>
            <div className="bulk-bar">
                <span className="bulk-bar-count">
                    <CheckCircle size={16} />
                    <strong>{selectedCount}</strong> {itemType} selected
                </span>
                <div className="bulk-bar-actions">
                    {isMessages ? (
                        <button className="bulk-btn bulk-btn--publish" onClick={onMarkRead}>
                            <Mail size={14} /> Mark All Read
                        </button>
                    ) : (
                        <>
                            {onPublish && (
                                <button className="bulk-btn bulk-btn--publish" onClick={onPublish}>
                                    Publish All
                                </button>
                            )}
                            {onDraft && (
                                <button className="bulk-btn bulk-btn--draft" onClick={onDraft}>
                                    Set to Draft
                                </button>
                            )}
                        </>
                    )}
                    <button
                        className="bulk-btn bulk-btn--delete"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 size={14} /> Delete All
                    </button>
                    <button className="bulk-btn bulk-btn--clear" onClick={onClear}>
                        <X size={14} /> Clear
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title={`Delete ${selectedCount} ${itemType}?`}
                message={`You are about to permanently delete ${selectedCount} ${itemType}. This action cannot be undone.`}
                confirmText={`Delete ${selectedCount} ${itemType}`}
                variant="danger"
                requireTyping
                typeConfirmWord="DELETE"
                typedValue={typedValue}
                onTypedChange={setTypedValue}
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setShowDeleteModal(false); setTypedValue(''); }}
                icon={<Trash2 size={28} />}
            />
        </>
    );
};

export default BulkOperationsBar;
