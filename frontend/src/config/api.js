// Configuration de l'URL de l'API backend
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper pour construire les URLs complètes
export const getApiUrl = (path) => {
  // Si pas de path, retourner vide
  if (!path) return '';
  
  // Si le path commence déjà par http://, le retourner tel quel
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // En développement (avec proxy), retourner le path relatif
  // En production, ajouter l'API_URL
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // Pour les chemins d'upload en production, ajouter l'API_URL
  if (path.startsWith('/uploads/') || path.startsWith('/api/')) {
    return `${API_URL}${path}`;
  }
  
  // Pour les autres chemins, les retourner tels quels
  return path;
};

export default { API_URL, getApiUrl };
