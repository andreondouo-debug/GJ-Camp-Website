// Configuration de l'URL de l'API backend
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper pour construire les URLs complètes
export const getApiUrl = (path) => {
  // Si pas de path, retourner vide
  if (!path) return '';
  
  // Si le path commence déjà par http://, le retourner tel quel (Cloudinary ou autre CDN)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si le path commence par /images/, c'est un fichier statique local
  if (path.startsWith('/images/')) {
    return path;
  }
  
  // En développement (avec proxy), retourner le path relatif pour /uploads/ et /api/
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // En production, ajouter l'API_URL pour tous les autres chemins
  // (uploads, api, ou chemins relatifs sans /)
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default { API_URL, getApiUrl };
