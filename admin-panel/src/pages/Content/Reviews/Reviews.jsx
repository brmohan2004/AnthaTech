import React, { useState, useEffect } from 'react';
import './Reviews.css';
import {
    Plus, Edit2, Trash2, X, MessageSquare,
    User, Check, AlertCircle, UploadCloud, Save
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';
import { getReviews, createReview, updateReview, deleteReview, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { uploadFile, generateFilePath } from '../../../api/media';

const initialForm = {
    id: null,
    author: '',
    role: '',
    company: '',
    quote: '',
    status: 'Active',
    avatar: null
};

const ReviewsManager = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [saving, setSaving] = useState(false);
    const [isMediaOpen, setIsMediaOpen] = useState(false);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await getReviews();
            setReviews(data || []);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load reviews.' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (review = null) => {
        if (review) {
            setFormData(review);
        } else {
            setFormData(initialForm);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(initialForm);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const path = generateFilePath('reviews/avatars', file.name);
            const url = await uploadFile(path, file);
            setFormData(prev => ({ ...prev, avatar: url }));
            setToast({ type: 'success', message: 'Avatar uploaded.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload avatar.' });
        } finally {
            setSaving(false);
        }
    };

    const saveReview = async () => {
        if (formData.quote.length > 300) {
            setToast({ type: 'warning', message: 'Quote exceeds 300 characters.' });
            return;
        }
        setSaving(true);
        try {
            const user = await getCurrentUser();
            if (formData.id) {
                const { id, ...updates } = formData;
                await updateReview(id, updates);

                // Log the update
                try {
                    await insertAuditLog({
                        admin_id: user?.id,
                        event_type: 'content',
                        description: `Updated Review: ${formData.author}`,
                        result: 'success'
                    });
                } catch (logErr) {
                    console.error('Audit log failed:', logErr);
                }

                setToast({ type: 'success', message: 'Review updated.' });
            } else {
                const { id, ...newData } = formData;
                await createReview(newData);

                // Log the creation
                try {
                    await insertAuditLog({
                        admin_id: user?.id,
                        event_type: 'content',
                        description: `Created new Review by: ${formData.author}`,
                        result: 'success'
                    });
                } catch (logErr) {
                    console.error('Audit log failed:', logErr);
                }

                setToast({ type: 'success', message: 'New review added.' });
            }
            handleCloseModal();
            await loadReviews();
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save review.' });
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (id, author) => {
        setDeleteModal({ isOpen: true, id, name: author });
    };

    const handleMediaSelect = (url) => {
        setFormData($ => ({ ...$, avatar: url }));
        setToast({ type: 'success', message: 'Avatar selected from library.' });
    };

    const executeDelete = async () => {
        try {
            await deleteReview(deleteModal.id);

            // Log the deletion
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Deleted Review by: ${deleteModal.name}`,
                    result: 'success'
                });
            } catch (logErr) {
                console.error('Audit log failed:', logErr);
            }

            setToast({ type: 'success', message: `Review by ${deleteModal.name} deleted.` });
            setDeleteModal({ isOpen: false });
            await loadReviews();
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to delete.' });
        }
    };

    return (
        <div className="reviews-manager">
            <header className="page-header">
                <div className="header-breadcrumbs">Content &gt; <span>Reviews</span></div>
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>Add New Review</Button>
            </header>

            <div className="panel p-0 overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th width="40">#</th>
                            <th>Author</th>
                            <th>Role</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th width="100">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((r, i) => (
                            <tr key={r.id}>
                                <td className="text-secondary">{i + 1}</td>
                                <td className="font-semibold">{r.author}</td>
                                <td>{r.role}</td>
                                <td className="text-secondary">{r.company}</td>
                                <td><span className="status-badge active"><Check size={12} /> {r.status}</span></td>
                                <td>
                                    <div className="row-actions">
                                        <button className="action-btn" onClick={() => handleOpenModal(r)}><Edit2 size={16} /></button>
                                        <button className="action-btn text-danger" onClick={() => confirmDelete(r.id, r.author)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Review Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content review-modal-card">
                        <div className="modal-header">
                            <h3>{formData.id ? 'Edit Review' : 'Add New Review'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Quote (max 300 chars) <span className={`char-limit ${formData.quote.length > 250 ? 'near-limit' : ''}`}>{formData.quote.length}/300</span></label>
                                <textarea
                                    name="quote"
                                    value={formData.quote}
                                    onChange={handleFormChange}
                                    className="form-input quote-textarea"
                                    placeholder='"Your review text here..."'
                                    maxLength={300}
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Author Name</label>
                                    <input type="text" name="author" value={formData.author} onChange={handleFormChange} className="form-input" placeholder="Lokesh Kumar" />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Role</label>
                                    <input type="text" name="role" value={formData.role} onChange={handleFormChange} className="form-input" placeholder="CEO" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Company</label>
                                <input type="text" name="company" value={formData.company} onChange={handleFormChange} className="form-input" placeholder="RecruiterOne" />
                            </div>

                            <div className="form-group">
                                <label>Author Avatar (Optional)</label>
                                <div className="avatar-upload-box">
                                    {formData.avatar ? (
                                        <div className="avatar-preview"><img src={formData.avatar} alt="Avatar" /></div>
                                    ) : (
                                        <User size={32} />
                                    )}
                                    <div className="upload-info">
                                        <p>Click to upload image</p>
                                        <span className="text-xs">Recommended: 1:1 ratio, 100x100px</span>
                                    </div>
                                    <div className="flex-col gap-2">
                                        <button 
                                            type="button" 
                                            className="btn-link secondary"
                                            onClick={() => setIsMediaOpen(true)}
                                        >
                                            📁 Media Library
                                        </button>
                                        <label className="btn-link secondary cursor-pointer">
                                            <UploadCloud size={14} /> Upload
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                disabled={saving}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                            <Button variant="primary" icon={<Save size={16} />} onClick={saveReview}>Save Review</Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Review?"
                message={`Remove review from "${deleteModal.name}"? This will hide it from the website immediately.`}
                onCancel={() => setDeleteModal({ isOpen: false })}
                onConfirm={executeDelete}
                requireTyping={false}
            />

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <MediaPickerModal
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default ReviewsManager;
