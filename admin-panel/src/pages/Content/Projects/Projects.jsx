import React, { useState, useEffect } from 'react';
import './Projects.css';
import { Plus, Search, LayoutGrid, List, MoreVertical, Edit2, Trash2, Image as ImageIcon, ArrowLeft, Save, UploadCloud, X, GripVertical, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ToastMessage from '../../../components/ui/ToastMessage';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import VersionHistoryDrawer from '../../../components/ui/VersionHistoryDrawer/VersionHistoryDrawer';
import ScheduledPublishPicker, { getCountdown } from '../../../components/ui/ScheduledPublishPicker/ScheduledPublishPicker';
import { getProjects, createProject, updateProject, deleteProject, getContentHistory, insertAuditLog } from '../../../api/content';
import { getCurrentUser } from '../../../api/auth';
import { uploadFile, generateFilePath } from '../../../api/media';
import MediaPickerModal from '../../../components/ui/MediaPickerModal';

const initialProjectState = {
    id: null,
    title: '',
    slug: '',
    category: '',
    status: 'Draft',
    scheduledDate: '',
    scheduledTime: '09:00',
    publishAt: null,
    coverImage: null,
    heroDescription: '',
    challenges: [{ id: 1, text: '' }],
    gallery: [],
    solutions: [{ id: 1, text: '' }],
    review: { quote: '', author: '', role: '', company: '' },
    relatedProjects: []
};



const ProjectsManager = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [currentView, setCurrentView] = useState('table'); // 'table' | 'edit'
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [versions, setVersions] = useState([]);

    // Editor state
    const [formData, setFormData] = useState(initialProjectState);

    // UI states
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [historyOpen, setHistoryOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [mediaTarget, setMediaTarget] = useState(null); // 'cover' | 'gallery'

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load projects.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProjects(); }, []);

    // ------ Table Actions ------
    const filteredProjects = projects.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleEdit = (project) => {
        const challenges = Array.isArray(project.challenges) && project.challenges.length
            ? project.challenges.map((t, i) => ({ id: i + 1, text: t }))
            : [{ id: 1, text: '' }];
        const solutions = Array.isArray(project.solutions) && project.solutions.length
            ? project.solutions.map((t, i) => ({ id: i + 1, text: t }))
            : [{ id: 1, text: '' }];
        setFormData({ ...initialProjectState, ...project, challenges, solutions });
        setCurrentView('edit');

        // Load version history
        if (project.id) {
            getContentHistory('projects', project.id)
                .then(setVersions)
                .catch(() => setVersions([]));
        }
    };

    const handleAddNew = () => {
        setFormData(initialProjectState);
        setCurrentView('edit');
    };

    const confirmDelete = (id, title) => {
        setDeleteModal({ isOpen: true, id, title });
    };

    const executeDelete = async () => {
        try {
            await deleteProject(deleteModal.id);
            const deletedTitle = deleteModal.title;
            setProjects(projects.filter(p => p.id !== deleteModal.id));
            setToast({ type: 'success', message: `Project "${deletedTitle}" deleted.` });

            // Add Audit Log Entry
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `Deleted Project: "${deletedTitle}"`,
                    result: 'success'
                });
            } catch (auditErr) {
                console.warn('Failed to log project deletion:', auditErr);
            }
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to delete project.' });
        } finally {
            setDeleteModal({ isOpen: false, id: null, title: '' });
        }
    };

    // ------ Editor Actions ------
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReviewChange = (e) => {
        setFormData(prev => ({ ...prev, review: { ...prev.review, [e.target.name]: e.target.value } }));
    };

    const handleArrayChange = (field, id, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map(item => item.id === id ? { ...item, text: value } : item)
        }));
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const path = generateFilePath('projects/covers', file.name);
            const url = await uploadFile(path, file);
            setFormData(prev => ({ ...prev, coverImage: url }));
            setToast({ type: 'success', message: 'Cover image uploaded.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload image.' });
        } finally {
            setSaving(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) return;

        setSaving(true);
        try {
            const newImages = [];
            for (const file of selectedFiles) {
                const path = generateFilePath('projects/gallery', file.name);
                const url = await uploadFile(path, file);
                newImages.push({ id: Date.now() + Math.random(), url });
            }
            setFormData(prev => ({
                ...prev,
                gallery: [...(prev.gallery || []), ...newImages]
            }));
            setToast({ type: 'success', message: `${newImages.length} images added to gallery.` });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to upload gallery images.' });
        } finally {
            setSaving(false);
        }
    };

    const removeGalleryImage = (id) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter(img => img.id !== id)
        }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], { id: Date.now(), text: '' }]
        }));
    };

    const removeArrayItem = (field, id) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item.id !== id)
        }));
    };

    const handleMediaSelect = (url) => {
        if (mediaTarget === 'cover') {
            setFormData(prev => ({ ...prev, coverImage: url }));
            setToast({ type: 'success', message: 'Cover image updated from library.' });
        } else if (mediaTarget === 'gallery') {
            setFormData(prev => ({
                ...prev,
                gallery: [...(prev.gallery || []), { id: Date.now(), url }]
            }));
            setToast({ type: 'success', message: 'Image added to gallery from library.' });
        }
        setMediaTarget(null);
    };

    const toggleRelatedProject = (projectId) => {
        const id = parseInt(projectId);
        setFormData(prev => {
            const current = prev.relatedProjects || [];
            if (current.includes(id)) {
                return { ...prev, relatedProjects: current.filter(pId => pId !== id) };
            } else {
                return { ...prev, relatedProjects: [...current, id] };
            }
        });
    };

    const saveProject = async (status) => {
        try {
            setSaving(true);
            const publishAt = status === 'Scheduled'
                ? (formData.scheduledDate && formData.scheduledTime
                    ? `${formData.scheduledDate}T${formData.scheduledTime}:00`
                    : null)
                : null;
            const payload = {
                title: formData.title,
                slug: formData.slug,
                category: formData.category,
                status,
                publish_at: publishAt,
                image: formData.image || formData.coverImage,
                hero_description: formData.heroDescription,
                challenges: formData.challenges.map(c => c.text).filter(Boolean),
                gallery: formData.gallery,
                solutions: formData.solutions.map(s => s.text).filter(Boolean),
                review: formData.review,
                related_projects: formData.relatedProjects,
            };
            if (formData.id) {
                await updateProject(formData.id, payload);
            } else {
                await createProject(payload);
            }
            setToast({ type: 'success', message: `Project saved as ${status}.` });

            // Add Audit Log Entry
            try {
                const user = await getCurrentUser();
                await insertAuditLog({
                    admin_id: user?.id,
                    event_type: 'content',
                    description: `${formData.id ? 'Updated' : 'Created'} Project: "${payload.title}"`,
                    result: 'success'
                });
            } catch (auditErr) {
                console.warn('Failed to log project save:', auditErr);
            }

            await loadProjects();
            setCurrentView('table');
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to save project.' });
        } finally {
            setSaving(false);
        }
    };

    // ------ Views ------

    if (currentView === 'edit') {
        return (
            <div className="projects-manager editor-view">
                <header className="page-header">
                    <div className="header-breadcrumbs">
                        Content &gt; <span className="breadcrumb-link" onClick={() => setCurrentView('table')}>Projects</span> &gt; <span>{formData.id ? `Edit — ${formData.title}` : 'Add New Project'}</span>
                    </div>
                    <div className="header-actions">
                        <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => setCurrentView('table')}>
                            Cancel
                        </Button>
                        <Button variant="ghost" icon={<Clock size={16} />} onClick={() => setHistoryOpen(true)}>
                            History
                        </Button>
                        <Button variant="secondary" onClick={() => saveProject(formData.status === 'Draft' ? 'Draft' : formData.status)}>
                            Save as Draft
                        </Button>
                        <Button variant="primary" icon={<Save size={16} />} onClick={() => saveProject('Published')}>
                            Publish ✓
                        </Button>
                    </div>
                </header>

                <div className="editor-grid">
                    {/* Main Column */}
                    <div className="editor-maincol">

                        <div className="panel">
                            <h3 className="panel-title">Basic Info</h3>
                            <div className="form-group">
                                <label>Project Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="form-input" placeholder="e.g. RecruiterOne" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Slug <span className="slug-check">{formData.slug ? '✓ exists' : ''}</span></label>
                                    <input type="text" name="slug" value={formData.slug} onChange={handleFormChange} className="form-input" placeholder="e.g. recruiterone" />
                                </div>
                                <div className="form-group">
                                    <label>Category Pill</label>
                                    <input type="text" name="category" value={formData.category} onChange={handleFormChange} className="form-input" placeholder="e.g. Human Recruit." />
                                </div>
                            </div>

                            <div className="form-section-divider">Hero Description</div>
                            <textarea name="heroDescription" value={formData.heroDescription} onChange={handleFormChange} className="form-input textarea-tall" placeholder="Hero text here..."></textarea>
                        </div>

                        <div className="panel">
                            <div className="panel-header-flex">
                                <h3 className="panel-title mb-0">Challenges</h3>
                                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => addArrayItem('challenges')}>Add Challenge</Button>
                            </div>
                            <div className="repeatable-list">
                                {formData.challenges.map((item) => (
                                    <div className="repeatable-item" key={item.id}>
                                        <GripVertical size={16} className="drag-handle" />
                                        <textarea className="form-input" value={item.text} onChange={(e) => handleArrayChange('challenges', item.id, e.target.value)} placeholder="Challenge description..."></textarea>
                                        <button className="icon-btn-danger" onClick={() => removeArrayItem('challenges', item.id)}><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel">
                            <div className="panel-header-flex">
                                <h3 className="panel-title mb-0">Gallery Images</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-link secondary" onClick={() => setMediaTarget('gallery')}>
                                        📁 Media Library
                                    </button>
                                    <label className="btn-link secondary cursor-pointer">
                                        <Plus size={14} /> Add Images
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            accept="image/*"
                                            onChange={handleGalleryUpload}
                                            disabled={saving}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="gallery-preview-grid">
                                {formData.gallery && formData.gallery.length > 0 ? (
                                    formData.gallery.map(img => (
                                        <div key={img.id} className="gallery-preview-item">
                                            <img src={img.url} alt="Gallery" />
                                            <button className="del-btn" onClick={() => removeGalleryImage(img.id)}><X size={12} /></button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="gallery-placeholder">
                                        <ImageIcon size={32} />
                                        <span>No images added</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="panel">
                            <div className="panel-header-flex">
                                <h3 className="panel-title mb-0">Solutions</h3>
                                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => addArrayItem('solutions')}>Add Solution</Button>
                            </div>
                            <div className="repeatable-list">
                                {formData.solutions.map((item) => (
                                    <div className="repeatable-item" key={item.id}>
                                        <GripVertical size={16} className="drag-handle" />
                                        <textarea className="form-input" value={item.text} onChange={(e) => handleArrayChange('solutions', item.id, e.target.value)} placeholder="Solution description..."></textarea>
                                        <button className="icon-btn-danger" onClick={() => removeArrayItem('solutions', item.id)}><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel">
                            <h3 className="panel-title">Client Review</h3>
                            <div className="form-group">
                                <label>Quote</label>
                                <textarea name="quote" value={formData.review.quote} onChange={handleReviewChange} className="form-input" placeholder='"Working with Antha Tech was..."'></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Author</label>
                                    <input type="text" name="author" value={formData.review.author} onChange={handleReviewChange} className="form-input" placeholder="Lokesh Kumar" />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input type="text" name="role" value={formData.review.role} onChange={handleReviewChange} className="form-input" placeholder="CEO" />
                                </div>
                                <div className="form-group">
                                    <label>Company</label>
                                    <input type="text" name="company" value={formData.review.company} onChange={handleReviewChange} className="form-input" placeholder="RecruiterOne" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="editor-sidecol">
                        <div className="panel">
                            <h3 className="panel-title">Cover Image</h3>
                            <div className="cover-image-uploader">
                                {formData.coverImage ? (
                                    <img src={formData.coverImage} className="cover-preview" alt="Cover" />
                                ) : (
                                    <div className="cover-empty"><ImageIcon size={40} /></div>
                                )}
                            </div>
                            <div className="cover-actions">
                                <button className="btn-link" onClick={() => setMediaTarget('cover')}>📁 Media Library</button>
                                <label className="btn-link cursor-pointer">
                                    ⬆ Upload New
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
                            <h3 className="panel-title">Status</h3>
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
                            <h3 className="panel-title">Related Projects</h3>
                            <select
                                className="form-input"
                                value=""
                                onChange={(e) => toggleRelatedProject(e.target.value)}
                            >
                                <option value="" disabled>Select project to link...</option>
                                {projects
                                    .filter(p => p.id !== formData.id && !(formData.relatedProjects || []).includes(p.id))
                                    .map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                                }
                            </select>
                            <div className="tags-container mt-3">
                                {(formData.relatedProjects || []).map(pId => {
                                    const p = projects.find(proj => proj.id === pId);
                                    if (!p) return null;
                                    return (
                                        <span className="pill-tag" key={pId}>
                                            {p.title} <X size={12} onClick={() => toggleRelatedProject(pId)} />
                                        </span>
                                    );
                                })}
                                {(formData.relatedProjects || []).length === 0 && (
                                    <span className="text-secondary" style={{ fontSize: '13px' }}>No related projects linked.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

                <VersionHistoryDrawer
                    isOpen={historyOpen}
                    onClose={() => setHistoryOpen(false)}
                    contentTitle={formData.title || 'New Project'}
                    contentType="Project"
                    versions={formData.id ? versions : []}
                    onRestore={(version) => {
                        setToast({ type: 'success', message: `Restored to version ${version.versionNum} successfully.` });
                        setHistoryOpen(false);
                    }}
                />
            </div>
        );
    }

    // TABLE VIEW
    return (
        <div className="projects-manager table-view">
            <header className="page-header">
                <div className="header-breadcrumbs">
                    Content &gt; <span>Projects</span>
                </div>
            </header>

            <div className="table-toolbar">
                <Button variant="primary" icon={<Plus size={16} />} onClick={handleAddNew}>
                    Add New Project
                </Button>

                <div className="toolbar-right">
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="view-toggles">
                        <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18} /></button>
                        <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="sched-tab-bar" style={{ marginBottom: 16 }}>
                {['All', 'Published', 'Draft', 'Scheduled'].map(tab => {
                    const count = tab === 'All' ? projects.length : projects.filter(p => p.status === tab).length;
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

            <div className="table-container panel">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th width="40">#</th>
                            <th width="60">Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            {statusFilter === 'Scheduled' && <th>Countdown</th>}
                            <th width="80">Acts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project, i) => (
                            <tr key={project.id}>
                                <td className="text-grey">{i + 1}</td>
                                <td><img src={project.image} alt={project.title} className="table-thumb" /></td>
                                <td className="title-cell" onClick={() => handleEdit(project)}>{project.title}</td>
                                <td><span className="category-pill">{project.category}</span></td>
                                <td>
                                    <span className={`status-pill ${project.status.toLowerCase()}`}>
                                        {project.status === 'Scheduled' ? '🕐 ' : ''}{project.status}
                                    </span>
                                </td>
                                {statusFilter === 'Scheduled' && (
                                    <td>
                                        {project.publishAt ? (
                                            <span className="countdown-cell">
                                                <Clock size={11} />
                                                {getCountdown(project.publishAt)}
                                            </span>
                                        ) : <span className="text-grey">—</span>}
                                    </td>
                                )}
                                <td>
                                    <div className="row-actions">
                                        <button className="action-btn" title="Edit" onClick={() => handleEdit(project)}><Edit2 size={16} /></button>
                                        <button className="action-btn text-danger" title="Delete" onClick={() => confirmDelete(project.id, project.title)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProjects.length === 0 && (
                            <tr><td colSpan="6" className="text-center py-5">No projects found.</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span className="text-grey">Showing 1–{filteredProjects.length} of {projects.length}</span>
                    <select className="pagination-select">
                        <option>10 / page</option>
                        <option>25 / page</option>
                        <option>50 / page</option>
                    </select>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Project?"
                message={`Are you sure you want to delete "${deleteModal.title}"? This cannot be undone.`}
                confirmText="Delete Project"
                onCancel={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                onConfirm={executeDelete}
                requireTyping={true}
            />

            {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <MediaPickerModal
                isOpen={!!mediaTarget}
                onClose={() => setMediaTarget(null)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default ProjectsManager;
