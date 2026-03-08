import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Video, FileText, Loader2 } from 'lucide-react';
import { listFiles } from '../../api/media';
import './MediaPickerModal.css';

const MediaPickerModal = ({ isOpen, onClose, onSelect }) => {
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState('all');

	useEffect(() => {
		if (isOpen) {
			loadFiles();
		}
	}, [isOpen]);

	const loadFiles = async () => {
		try {
			setLoading(true);
			const data = await listFiles('uploads');
			setFiles(data.map((f, i) => ({
				id: f.path || i,
				name: f.name,
				type: f.type || 'image/jpeg',
				url: f.url,
				path: f.path,
			})));
		} catch (err) {
			console.error('Error loading media library:', err);
		} finally {
			setLoading(false);
		}
	};

	const getFileKind = (type) => {
		if (type.startsWith('image/')) return 'image';
		if (type.startsWith('video/')) return 'video';
		return 'document';
	};

	const filteredFiles = files.filter((file) => {
		const kind = getFileKind(file.type);
		const matchesFilter = filter === 'all' || filter === kind;
		const matchesSearch = !search || file.name.toLowerCase().includes(search.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	if (!isOpen) return null;

	return (
		<div className="media-modal-overlay">
			<div className="media-modal-content">
				<div className="media-modal-header">
					<h2>Select Asset</h2>
					<button className="close-modal" onClick={onClose}>
						<X size={24} />
					</button>
				</div>

				<div className="media-toolbar" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
					<div className="media-search-wrapper" style={{ flex: 1, position: 'relative' }}>
						<Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
						<input
							type="text"
							placeholder="Search files..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							style={{ width: '100%', paddingLeft: '35px', paddingRight: '10px', height: '36px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
						/>
					</div>
					<div className="media-filter-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
						{['all', 'image', 'video', 'document'].map(f => (
							<button
								key={f}
								className={`filter-btn ${filter === f ? 'active' : ''}`}
								onClick={() => setFilter(f)}
								style={{ 
									padding: '0.5rem 1rem', 
									borderRadius: '6px', 
									border: '1px solid var(--border-color)', 
									background: filter === f ? 'var(--accent-primary)' : 'var(--bg-secondary)',
									color: filter === f ? '#fff' : 'var(--text-secondary)',
									cursor: 'pointer',
									textTransform: 'capitalize'
								}}
							>
								{f}
							</button>
						))}
					</div>
				</div>

				<div className="media-modal-body">
					{loading ? (
						<div className="loading-spinner">
							<Loader2 size={32} className="animate-spin" />
						</div>
					) : (
						<div className="media-picker-grid">
							{filteredFiles.map((file) => (
								<div 
									key={file.id} 
									className="media-picker-item"
									onClick={() => {
										onSelect(file.url);
										onClose();
									}}
								>
									<div className="media-picker-preview">
										{getFileKind(file.type) === 'image' ? (
											<img src={file.url} alt={file.name} loading="lazy" />
										) : getFileKind(file.type) === 'video' ? (
											<Video size={32} />
										) : (
											<FileText size={32} />
										)}
									</div>
									<div className="media-picker-info" title={file.name}>
										{file.name}
									</div>
								</div>
							))}
						</div>
					)}
					{!loading && filteredFiles.length === 0 && (
						<div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
							No files found.
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MediaPickerModal;
