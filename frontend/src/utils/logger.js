/**
 * Logger conditionnel pour l'application
 * 
 * En développement : Affiche tous les logs
 * En production : Affiche uniquement les erreurs et warnings
 * 
 * Usage:
 * import logger from '../utils/logger';
 * 
 * logger.log('Message normal');
 * logger.debug('Message de debug');
 * logger.info('Information');
 * logger.warn('Avertissement');
 * logger.error('Erreur');
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  /**
   * Log normal (désactivé en production)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log d'information (désactivé en production)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug avec préfixe 🔍 (désactivé en production)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('🔍 DEBUG:', ...args);
    }
  },

  /**
   * Avertissement (toujours affiché)
   */
  warn: (...args) => {
    console.warn(...args);
  },

  /**
   * Erreur (toujours affichée)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log de succès avec emoji ✅ (désactivé en production)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  /**
   * Log d'API avec emoji 📡 (désactivé en production)
   */
  api: (...args) => {
    if (isDevelopment) {
      console.log('📡 API:', ...args);
    }
  },

  /**
   * Log de state/données avec emoji 🎯 (désactivé en production)
   */
  state: (...args) => {
    if (isDevelopment) {
      console.log('🎯 STATE:', ...args);
    }
  },

  /**
   * Grouper les logs (désactivé en production)
   */
  group: (label) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Table pour afficher des données structurées (désactivé en production)
   */
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};

export default logger;
