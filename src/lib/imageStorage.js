import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_FILE = path.join(__dirname, '../data/images.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function getImages() {
  try {
    if (!fs.existsSync(IMAGES_FILE)) {
      return { dresses: [], tops: [], sets: [], sweaters: [] };
    }
    const data = fs.readFileSync(IMAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading images:', error);
    return { dresses: [], tops: [], sets: [], sweaters: [] };
  }
}

export function saveImages(images) {
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving images:', error);
    return false;
  }
}

export function addImage(category, imageData) {
  const images = getImages();
  if (!images[category]) {
    images[category] = [];
  }
  
  const newImage = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    url: imageData.url,
    price: imageData.price || '',
    createdAt: new Date().toISOString(),
  };
  
  images[category].push(newImage);
  saveImages(images);
  return newImage;
}

export function deleteImage(category, imageId) {
  const images = getImages();
  if (!images[category]) {
    return false;
  }
  
  const imageIndex = images[category].findIndex(img => img.id === imageId);
  if (imageIndex === -1) {
    return false;
  }
  
  // Delete the file from public/uploads
  const image = images[category][imageIndex];
  if (image.url && image.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', image.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }
  
  images[category].splice(imageIndex, 1);
  saveImages(images);
  return true;
}

export function getImagesByCategory(category, page = 1, limit = 20) {
  const images = getImages();
  const categoryImages = images[category] || [];
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedImages = categoryImages.slice(startIndex, endIndex);
  
  return {
    images: paginatedImages.map(img => ({
      public_id: img.id,
      secure_url: img.url,
      tags: img.price ? [img.price] : [],
    })),
    next_cursor: endIndex < categoryImages.length ? (page + 1).toString() : null,
    total: categoryImages.length,
  };
}

