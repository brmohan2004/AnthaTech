import React, { useState, useEffect } from 'react';
import './Blog.css';
import {
    Plus, Search, Edit2, Trash2, ArrowLeft, Save,
    UploadCloud, Image as ImageIcon, X, Link,
    Calendar, FileText, Globe, Eye, Clock
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import ScheduledPublishPicker, { getCountdown } from '../../../components/ui/ScheduledPublishPicker/ScheduledPublishPicker';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { uploadFile, generateFilePath } from '../../../api/media';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';

const initialPostState = {
    id: null,
    title: '',
    slug: '',
    date: '',
    shortDesc: '',
    content: '',
    url: '',
    coverImage: null,
    status: 'Draft',
    scheduledDate: '',
    scheduledTime: '09:00',
    publishAt: null,
    tags: []
};

const BlogManager = () => {
    const [currentView, setCurrentView] = useState('table');
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor state
    const [formData, setFormData] = useState(initialPostState);
    const [tagInput, setTagInput] = useState('');

    // UI states
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [statusFilter, setStatusFilter] = useState('All');
    const [isMediaOpen, setIsMediaOpen] = useState(false);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await getBlogPosts();
            setPosts(data);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load posts.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPosts(); }, []);

    // ------ Table Filter ------
    const filteredPosts = posts.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ------ Handlers ------
    const handleAddNew = () => {
        setFormData(initialPostState);
        setCurrentView('edit');
    };

    const handleEdit = (post) => {
        setFormData({
            ...initialPostState,
            ...post,
            shortDesc: post.short_desc || post.shortDesc || '',
            tags: post.tags || []
        });
        setCurrentView('edit');
    };

    const confirmDelete = (id, title) => {
        setDeleteModal({ isOpen: true, id, title });
    };

    const executeDelete = async () => {
        try {
            await deleteBlogPost(deleteModal.id);
            const deletedTitle = deleteModal.title;
            setPosts(posts.filter(p => p.id !== deleteModal.id));
            setToast({ type: 'success', message: 'Post deleted.' });

            // Add Audit Log Entry
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Deleted Blog Post: "${deletedTitle}"`,
                    result: 'success'
                });
            } catch (auditErr) {
                console.warn('Failed to log blog deletion:', auditErr);
            }
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to delete post.' });
        } finally {
            setDeleteModal({ isOpen: false });
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const handleMediaSelect = (url) => {
        setFormData(prev => ({ ...prev, coverImage: url }));
        setToast({ type: 'success', message: 'Cover image updated from library.' });
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const path = generateFilePath('blog/covers', file.name);
            const url = await uploadFile(path, file);
            setFormData(prev => ({ ...prev, coverImage: url }));
            setToast({ type: 'success', message: 'Blog cover image uploaded.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload blog cover image.' });
        } finally {
            setSaving(false);
        }
    };

    const savePost = async (statusArg) => {
        try {
            setSaving(true);
            const status = statusArg || formData.status;
            const publishAt = status === 'Scheduled'
                ? (formData.scheduledDate && formData.scheduledTime
                    ? `${formData.scheduledDate}T${formData.scheduledTime}:00`
                    : null)
                : null;
            const payload = {
                title: formData.title,
                slug: formData.slug,
                short_desc: formData.shortDesc,
                content: formData.content,
                url: formData.url,
                cover: formData.coverImage || formData.cover,
                status,
                publish_at: publishAt,
                tags: formData.tags,
            };
            if (formData.id) {
                await updateBlogPost(formData.id, payload);
            } else {
                await createBlogPost(payload);
            }
            setToast({ type: 'success', message: status === 'Scheduled'
                ? `Post scheduled — goes live ${formData.scheduledDate || 'on set date'}.`
                : `Post saved as ${status}.`
            });

            // Add Audit Log Entry
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `${formData.id ? 'Updated' : 'Created'} Blog Post: "${payload.title}"`,
                    result: 'success'
                });
            } catch (auditErr) {
                console.warn('Failed to log blog save:', auditErr);
            }

            await loadPosts();
            setCurrentView('table');
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save post.' });
        } finally {
            setSaving(false);
        }
    };

    // ------ Render Table View ------
    if (currentView === 'table') {
        return (
            <div className="blog-manager">
                <header className="page-header">
                    <div className="header-breadcrumbs">Content &gt; <span>Insights</span></div>
                    <Button variant="primary" icon={<Plus size={16} />} onClick={handleAddNew}>Add New Post</Button>
                </header>

                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status filter tabs */}
                <div className="sched-tab-bar" style={{ marginBottom: 16 }}>
                    {['All', 'Published', 'Draft', 'Scheduled'].map(tab => {
                        const count = tab === 'All' ? posts.length : posts.filter(p => p.status === tab).length;
                        return (
                            <button
                                key={tab}
                                className={`sched-tab ${statusFilter === tab ? 'sched-tab-active' : ''}`}
                                onClick={() => setStatusFilter(tab)}
                            >
                                {tab === 'Scheduled' ? '🕐 ' : ''}{tab}
                                {count > 0 && tab !== 'All' && (
                                    <span className="sched-tab-count">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="panel p-0 overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th width="40">#</th>
                                <th width="80">Cover</th>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                {statusFilter === 'Scheduled' && <th>Countdown</th>}
                                <th width="100">Acts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map((post, i) => (
                                <tr key={post.id}>
                                    <td className="text-secondary">{i + 1}</td>
                                    <td><img src={post.cover} className="table-cover" alt="" /></td>
                                    <td className="font-semibold clickable" onClick={() => handleEdit(post)}>{post.title}</td>
                                    <td className="text-secondary">{post.date}</td>
                                    <td>
                                        <span className={`status-pill ${post.status.toLowerCase()}`}>
                                            {post.status === 'Scheduled' ? '🕐 ' : ''}{post.status}
                                        </span>
                                    </td>
                                    {statusFilter === 'Scheduled' && (
                                        <td>
                                            {post.publishAt ? (
                                                <span className="countdown-cell">
                                                    <Clock size={11} />
                                                    {getCountdown(post.publishAt)}
                                                </span>
                                            ) : <span className="text-secondary">—</span>}
                                        </td>
                                    )}
                                    <td>
                                        <div className="row-actions">
                                            <button className="action-btn" onClick={() => handleEdit(post)}><Edit2 size={16} /></button>
                                            <button className="action-btn text-danger" onClick={() => confirmDelete(post.id, post.title)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    title="Delete Post?"
                    message={`Are you sure you want to delete "${deleteModal.title}"?`}
                    onCancel={() => setDeleteModal({ isOpen: false })}
                    onConfirm={executeDelete}
                    requireTyping={true}
                />
                {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            </div>
        );
    }

    // ------ Render Editor View ------
    return (
        <div className="blog-manager editor-view">
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Content &gt; <span className="clickable" onClick={() => setCurrentView('table')}>Insights</span> &gt; <span>{formData.id ? 'Edit Post' : 'New Post'}</span>
                </div>
                <div className="header-actions">
                    <Button variant="ghost" onClick={() => setCurrentView('table')}>Cancel</Button>
                    <Button variant="secondary" onClick={() => savePost('Draft')}>Save Draft</Button>
                    <Button
                        variant="primary"
                        icon={formData.status === 'Scheduled' ? <Clock size={16} /> : <Save size={16} />}
                        onClick={() => savePost(formData.status)}
                    >
                        {formData.status === 'Scheduled' ? 'Schedule 🕐' : 'Publish ✓'}
                    </Button>
                </div>
            </header>

            <div className="editor-grid">
                <div className="main-col">
                    <div className="panel">
                        <h3 className="section-title">Article Details</h3>

                        <div className="form-group">
                            <label>Post Title <span className="char-count">{formData.title.length}/100</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                                className="form-input title-input"
                                maxLength={100}
                                placeholder="Explore the ever-evolving digital landscape"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Slug</label>
                                <div className="input-with-icon">
                                    <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} className="form-input" placeholder="digital-landscape" />
                                    <span className="slug-status text-success">✓</span>
                                </div>
                            </div>
                            <div className="form-group flex-1">
                                <label>Date Label</label>
                                <div className="input-with-icon">
                                    <Calendar size={14} className="field-icon" />
                                    <input type="text" name="date" value={formData.date} onChange={handleFormChange} className="form-input has-icon" placeholder="1 yr ago" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Short Description <span className="char-count">{formData.shortDesc.length}/200</span></label>
                            <textarea
                                name="shortDesc"
                                value={formData.shortDesc}
                                onChange={handleFormChange}
                                className="form-input tall"
                                maxLength={200}
                                placeholder="With insights on design, development..."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Full Content (Rich Text Editor)</label>
                            <div className="rich-editor-placeholder">
                                <div className="editor-toolbar">
                                    <button className="tool-btn"><b>B</b></button>
                                    <button className="tool-btn"><i>I</i></button>
                                    <button className="tool-btn">H1</button>
                                    <button className="tool-btn">H2</button>
                                    <button className="tool-btn"><Link size={14} /></button>
                                    <button className="tool-btn"><ImageIcon size={14} /></button>
                                </div>
                                <textarea className="editor-area" placeholder="Write your article content here..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="side-col">
                    <div className="panel">
                        <h3 className="section-title">Cover Image</h3>
                        <div className="cover-preview-box">
                            {formData.coverImage ? <img src={formData.coverImage} alt="" /> : <ImageIcon size={40} />}
                        </div>
                        <div className="cover-acts">
                            <button className="btn-link" onClick={() => setIsMediaOpen(true)}><ImageIcon size={14} /> Media Library</button>
                            <button className="btn-link"><Link size={14} /> Paste URL</button>
                            <label className="btn-link secondary cursor-pointer">
                                <UploadCloud size={14} /> Upload
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    disabled={saving}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="panel">
                        <h3 className="section-title">Organization</h3>
                        <div className="form-group">
                            <label>Link / URL</label>
                            <input type="text" name="url" value={formData.url} onChange={handleFormChange} className="form-input" placeholder="/insights/digital-landscape" />
                        </div>
                        <div className="form-group">
                            <label>Tags</label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                className="form-input"
                                placeholder="Add tag..."
                            />
                            <div className="tag-pills mt-2">
                                {formData.tags.map(t => <span key={t} className="tag-pill">{t} <X size={12} onClick={() => removeTag(t)} /></span>)}
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <h3 className="section-title">Status</h3>
                        <ScheduledPublishPicker
                            status={formData.status}
                            scheduledDate={formData.scheduledDate}
                            scheduledTime={formData.scheduledTime}
                            onChange={({ status, scheduledDate, scheduledTime }) =>
                                setFormData(prev => ({ ...prev, status, scheduledDate, scheduledTime }))
                            }
                        />
                    </div>

                    <div className="panel">
                        <h3 className="section-title">Preview</h3>
                        <div className="mini-blog-card">
                            <div className="mini-card-img"></div>
                            <div className="mini-card-body">
                                <div className="mini-card-meta">{formData.date || 'Date'} • 2 min read</div>
                                <div className="mini-card-title">{formData.title || 'Untitled Post'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <MediaPickerModal
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default BlogManager;
