import { uploadToCloudinary } from './cloudinary';
import supabase from '../config/supabaseClient';

// Helper to get all tracked media from site_config as a "mock" filesystem since Cloudinary
// doesn't allow unsigned list/delete via frontend.
async function getMediaRegistry() {
  const { data, error } = await supabase.from('site_config').select('value').eq('key', 'media_library').maybeSingle();
  if (error) throw new Error(`Failed to fetch media registry: ${error.message}`);
  if (!data) {
    // Initialize if it doesn't exist
    const { error: insErr } = await supabase.from('site_config').insert({ key: 'media_library', value: '[]' });
    if (insErr) throw new Error(`Failed to initialize media registry: ${insErr.message}`);
    return [];
  }
  try {
    return JSON.parse(data.value || '[]');
  } catch (err) {
    throw new Error(`Media registry JSON is corrupt: ${err.message}`);
  }
}

async function saveMediaRegistry(registry) {
  const { error } = await supabase.from('site_config').update({ value: JSON.stringify(registry) }).eq('key', 'media_library');
  if (error) throw new Error(`Failed to save media registry: ${error.message}`);
}

// Upload a file to Cloudinary and track it in Supabase DB
export async function uploadFile(path, file) {
  // 1. Upload to Cloudinary
  const cloudinaryUrl = await uploadToCloudinary(file);

  // 2. Save metadata to DB to track the file
  const registry = await getMediaRegistry();

  const fileData = {
    name: file.name,
    path: path,
    url: cloudinaryUrl,
    size: file.size,
    type: file.type,
    createdAt: new Date().toISOString()
  };

  // Add to top of list
  registry.unshift(fileData);
  await saveMediaRegistry(registry);

  return cloudinaryUrl;
}

// Remove tracking (does NOT delete from Cloudinary for safety)
export async function deleteFile(path) {
  const registry = await getMediaRegistry();
  const updated = registry.filter(f => f.path !== path);
  await saveMediaRegistry(updated);
}

export async function deleteFiles(paths) {
  const registry = await getMediaRegistry();
  const updated = registry.filter(f => !paths.includes(f.path));
  await saveMediaRegistry(updated);
}

// Just return the path since path could just be the Cloudinary URL in our new logic, 
// or if we need to look it up we do. We'll simply return the path directly or look it up.
export function getPublicUrl(path) {
  // Because we return public URLs directly now, if the path looks like http, just return it.
  if (path.startsWith('http')) return path;
  return path;
}

// List tracked files
export async function listFiles(folder) {
  const registry = await getMediaRegistry();
  // Return all items in our registry
  return registry.map(f => ({
    name: f.name,
    path: f.path,
    url: f.url,
    size: f.size || 0,
    type: f.type || '',
    createdAt: f.createdAt,
  }));
}

// We don't really have subfolders in our flat DB tracking
export async function listFolders(folder) {
  return [];
}

// Helper: Generate unique filename with timestamp
export function generateFilePath(folder, fileName) {
  const ext = fileName.split('.').pop();
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const timestamp = Date.now();
  return `${folder}/${baseName}-${timestamp}.${ext}`;
}