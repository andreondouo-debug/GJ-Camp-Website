// Configuration de l'URL de l'API backend
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper pour construire les URLs complètes
export const getApiUrl = (path) => {
  // Si le path commence déjà par http://, le retourner tel quel
  if (path?.startsWith('http://') || path?.startsWith('https://')) {
    return path;
  }
  
  // Pour les chemins d'upload, ajouter l'API_URL
  if (path?.startsWith('/uploads/')) {
    return `${API_URL}${path}`;
  }
  
  // Pour les autres chemins, les retourner tels quels (gérés par le proxy en dev)
  return path;
};

export default { API_URL, getApiUrl };
