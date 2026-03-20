import React, { useState, useEffect } from 'react';
import { UploadCloud, Grid3X3, List, Search, Image as ImageIcon, FileText, Video, Trash2, Copy } from 'lucide-react';
import './MediaLibrary.css';
import { uploadFile, deleteFile, getPublicUrl, listFiles, generateFilePath } from '../../api/media';
import ToastMessage from '../../components/ui/ToastMessage';

const getFileKind = (type) => {
	if (type.startsWith('image/')) return 'image';
	if (type.startsWith('video/')) return 'video';
	return 'document';
};

const MediaLibrary = () => {
	const [viewMode, setViewMode] = useState('grid');
	const [filter, setFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [uploading, setUploading] = useState(false);
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [toast, setToast] = useState(null);

	const loadFiles = async () => {
		try {
			setLoading(true);
			const data = await listFiles('uploads');
			setFiles(data.map((f, i) => ({
				id: f.path || i,
				name: f.name,
				type: f.type || 'application/octet-stream',
				size: f.size ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : '—',
				uploadedAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—',
				url: f.url,
				path: f.path,
			})));
		} catch (err) {
			setToast({ type: 'error', message: err.message || 'Failed to load media library.' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { loadFiles(); }, []);

	const handleFileSelect = async (event) => {
		const selectedFiles = Array.from(event.target.files || []);
		if (!selectedFiles.length) return;

		setUploading(true);
		try {
			for (const file of selectedFiles) {
				const path = generateFilePath('uploads', file.name);
				await uploadFile(path, file);
			}
			await loadFiles();
		} catch (err) {
			setToast({ type: 'error', message: err.message || 'Failed to upload files.' });
		} finally {
			setUploading(false);
		}
	};

	const handleDrop = async (event) => {
		event.preventDefault();
		const droppedFiles = Array.from(event.dataTransfer.files || []);
		if (!droppedFiles.length) return;

		setUploading(true);
		try {
			for (const file of droppedFiles) {
				const path = generateFilePath('uploads', file.name);
				await uploadFile(path, file);
			}
			await loadFiles();
		} catch (err) {
			setToast({ type: 'error', message: err.message || 'Failed to upload files.' });
		} finally {
			setUploading(false);
		}
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const handleCopyUrl = (url) => {
		if (!url || url === '#') return;
		navigator.clipboard.writeText(url).then(() => {
			setToast({ type: 'success', message: 'URL copied to clipboard.' });
		}).catch(() => {
			setToast({ type: 'error', message: 'Failed to copy URL.' });
		});
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this file from media library?')) return;
		const file = files.find(f => f.id === id);
		try {
			if (file?.path) await deleteFile(file.path);
			setFiles((prev) => prev.filter((f) => f.id !== id));
		} catch (err) {
			setToast({ type: 'error', message: err.message || 'Failed to delete file.' });
		}
	};

	const filteredFiles = files.filter((file) => {
		const kind = getFileKind(file.type);
		const matchesFilter = filter === 'all' || filter === kind;
		const matchesSearch = !search || file.name.toLowerCase().includes(search.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	const renderFileThumbnail = (file) => {
		const kind = getFileKind(file.type);
		if (kind === 'image' && file.url && file.url !== '#') {
			return <img src={file.url} alt={file.name} className="media-thumbnail-img" loading="lazy" />;
		}
		return (
			<div className="media-card-icon">
				{kind === 'image' ? <ImageIcon size={20} /> : 
				 kind === 'video' ? <Video size={20} /> : 
				 <FileText size={20} />}
			</div>
		);
	};

	const renderFileIcon = (file) => {
		const kind = getFileKind(file.type);
		if (kind === 'image') return <ImageIcon size={18} />;
		if (kind === 'video') return <Video size={18} />;
		return <FileText size={18} />;
	};

	return (
		<div className="media-library">
			<div className="media-header">
				<div className="media-header-left">
					<h1 className="media-title">Media Library</h1>
					<p className="media-subtitle">Manage all images, videos, and documents used across the site.</p>
				</div>
				<div className="media-header-actions">
					<label className="media-upload-button">
						<UploadCloud size={18} />
						<span>{uploading ? 'Uploading…' : 'Upload Media'}</span>
						<input
							type="file"
							multiple
							accept="image/*,video/*,.pdf"
							onChange={handleFileSelect}
						/>
					</label>
				</div>
			</div>

			<div
				className="media-upload-dropzone"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				<UploadCloud size={32} />
				<div className="dropzone-text-main">Drag & drop files here</div>
				<div className="dropzone-text-sub">or click "Upload Media" to browse. Supported: JPG, PNG, WebP, SVG, MP4, PDF.</div>
			</div>

			<div className="media-toolbar">
				<div className="media-search-wrapper">
					<Search size={16} />
					<input
						type="text"
						placeholder="Search by filename..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="media-toolbar-right">
					<div className="media-filter-tabs">
						<button
							className={filter === 'all' ? 'active' : ''}
							onClick={() => setFilter('all')}
						>
							All
						</button>
						<button
							className={filter === 'image' ? 'active' : ''}
							onClick={() => setFilter('image')}
						>
							Images
						</button>
						<button
							className={filter === 'video' ? 'active' : ''}
							onClick={() => setFilter('video')}
						>
							Videos
						</button>
						<button
							className={filter === 'document' ? 'active' : ''}
							onClick={() => setFilter('document')}
						>
							Documents
						</button>
					</div>
					<div className="media-view-toggle">
						<button
							className={viewMode === 'grid' ? 'active' : ''}
							onClick={() => setViewMode('grid')}
							title="Grid view"
						>
							<Grid3X3 size={16} />
						</button>
						<button
							className={viewMode === 'list' ? 'active' : ''}
							onClick={() => setViewMode('list')}
							title="List view"
						>
							<List size={16} />
						</button>
					</div>
				</div>
			</div>

			{filteredFiles.length === 0 ? (
				<div className="media-empty-state">
					<div className="media-empty-illustration">🖼️</div>
					<h2>No media yet</h2>
					<p>Upload your first image, video, or document to start building your media library.</p>
				</div>
			) : viewMode === 'grid' ? (
				<div className="media-grid">
					{filteredFiles.map((file) => (
						<div className="media-card" key={file.id}>
							<div className="media-card-thumbnail">
								{renderFileThumbnail(file)}
							</div>
							<div className="media-card-body">
								<div className="media-card-name" title={file.name}>{file.name}</div>
								<div className="media-card-meta">{file.size} · {file.uploadedAt}</div>
							</div>
							<div className="media-card-actions">
								<button
									className="media-card-btn"
									onClick={() => handleCopyUrl(file.url)}
									disabled={!file.url || file.url === '#'}
									title="Copy URL"
								>
									<Copy size={14} />
								</button>
								<button
									className="media-card-btn media-card-btn--danger"
									onClick={() => handleDelete(file.id)}
									title="Delete"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="media-list-wrapper">
					<table className="media-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Type</th>
								<th>Size</th>
								<th>Date Uploaded</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredFiles.map((file) => (
								<tr key={file.id}>
									<td>
										<div className="media-table-name">
											<span className="media-table-icon">{renderFileIcon(file)}</span>
											<span className="media-table-filename" title={file.name}>{file.name}</span>
										</div>
									</td>
									<td>{getFileKind(file.type)}</td>
									<td>{file.size}</td>
									<td>{file.uploadedAt}</td>
									<td>
										<div className="media-table-actions">
											<button
												className="media-card-btn"
												onClick={() => handleCopyUrl(file.url)}
												disabled={!file.url || file.url === '#'}
												title="Copy URL"
											>
												<Copy size={14} />
											</button>
											<button
												className="media-card-btn media-card-btn--danger"
												onClick={() => handleDelete(file.id)}
												title="Delete"
											>
												<Trash2 size={14} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
		</div>
	);
};

export default MediaLibrary;

