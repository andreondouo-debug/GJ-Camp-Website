/**
 * SettingsPage - Panneau d'administration des paramètres du site
 * Accessible uniquement aux utilisateurs avec rôle "admin"
 * Permet de modifier tous les paramètres de la charte graphique
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // États pour chaque section de paramètres
  const [settings, setSettings] = useState({
    // Palette de couleurs
    colorPrimary: '#a01e1e',
    colorPrimaryLight: '#e74c3c',
    colorPrimaryDark: '#7a1515',
    colorSecondary: '#d4af37',
    colorGoldLight: '#f3d87c',
    colorGoldDark: '#b8942a',
    colorNavy: '#001a4d',
    
    // Typographie
    fontPrimary: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    fontHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    textBase: '1rem',
    textLg: '1.125rem',
    textXl: '1.25rem',
    text2xl: '1.5rem',
    
    // Espacements
    spaceXs: '0.25rem',
    spaceSm: '0.5rem',
    spaceMd: '1rem',
    spaceLg: '1.5rem',
    spaceXl: '2rem',
    
    // Border Radius
    radiusSm: '0.25rem',
    radiusMd: '0.5rem',
    radiusLg: '0.75rem',
    radiusXl: '1rem',
    radius2xl: '1.5rem',
    
    // Ombres
    shadowSm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    shadowMd: '0 4px 12px rgba(0, 0, 0, 0.15)',
    shadowLg: '0 8px 24px rgba(0, 0, 0, 0.2)',
    
    // Transitions
    transitionFast: '150ms',
    transitionBase: '300ms',
    transitionSlow: '500ms',
    
    // Dark Mode
    darkModeEnabled: false,
    
    // Animations
    animationsEnabled: true,
    hoverEffectsEnabled: true,
    glassmorphismEnabled: true,
    
    // Compte à rebours
    countdownDate: '2026-08-19T00:00:00',
    countdownTitle: 'Camp GJ dans',
    
    // Logo GJ
    logoUrl: '',
    logoWidth: '120px',
    logoHeight: 'auto',
    
    // Logo CRPT
    crptLogoUrl: '',
    logoShape: 'none', // 'none', 'circle', 'rounded', 'square', 'hexagon'
    logoEffect: 'none', // 'none', 'shadow', 'glow', 'border', 'gradient-border', '3d'
    logoAnimation: 'none', // 'none', 'pulse', 'rotate', 'bounce', 'scale'
    logoBorderColor: '#d4af37',
    logoGlowColor: '#d4af37',
    logoPosition: 'header', // 'header', 'fixed-top-left', 'fixed-top-right', 'fixed-bottom-left', 'fixed-bottom-right', 'custom'
    logoCustomX: '50', // Position X en pixels (si position custom)
    logoCustomY: '50', // Position Y en pixels (si position custom)
    
    // Fonds d'écran
    backgroundType: 'gradient', // 'gradient', 'image', 'color'
    backgroundImage: '',
    backgroundColorStart: '#667eea',
    backgroundColorEnd: '#764ba2',
    backgroundSolidColor: '#ffffff',
    
    // Fonds par page
    homeBackground: 'default',
    aboutBackground: 'default',
    activitiesBackground: 'default',
    
    // Styles d'en-tête
    headerStyle: 'gradient', // 'gradient', 'solid', 'transparent'
    headerTextColor: '#ffffff',
    
    // Réseaux sociaux
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    
    // Paramètres du carrousel
    carouselEnabled: true,
    carouselHeight: '500px',
    carouselAutoplayInterval: 6000,
    carouselTransitionDuration: 1000,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('colors');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [crptLogoFile, setCrptLogoFile] = useState(null);
  const [crptLogoPreview, setCrptLogoPreview] = useState('');
  const [pwaLogoFile, setPwaLogoFile] = useState(null);
  const [pwaLogoPreview, setPwaLogoPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // États pour le verrouillage de la page
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);
  const [hasLock, setHasLock] = useState(false);
  
  // États pour le test des notifications OneSignal
  const [testNotification, setTestNotification] = useState({
    testType: 'me', // 'me', 'user', 'all'
    userId: '',
    title: '🧪 Test OneSignal',
    message: 'Ceci est une notification de test'
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  
  // États pour la gestion du carrousel
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    image: null,
    imagePreview: '',
    title: '',
    description: '',
    description2: '',
    description3: '',
    order: 0,
    imageSize: 'cover', // 'cover', 'contain', 'auto'
    page: 'home', // 'home', 'about', 'activities'
    overlayOpacity: 50, // 0-100
    contentPosition: 'center' // 'top', 'center', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  });

  // État pour l'édition d'une slide existante
  const [editingSlide, setEditingSlide] = useState(null);
  
  // État pour l'aperçu complet de la slide
  const [previewSlide, setPreviewSlide] = useState(null);

  // Référence pour la zone de texte
  const descriptionRef = useRef(null);
  const description2Ref = useRef(null);
  const description3Ref = useRef(null);

  // Vérifier les permissions admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/access-denied');
    }
  }, [user, navigate]);

  // Vérifier et acquérir le verrou de la page
  useEffect(() => {
    let lockCheckInterval;
    let currentHasLock = false;

    const checkLockStatus = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/settings/lock/status'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.locked && !response.data.ownedByCurrentUser) {
          setIsLocked(true);
          setLockInfo(response.data);
          setHasLock(false);
        } else {
          setIsLocked(false);
          setLockInfo(null);
          
          // Si pas de verrou actif, essayer de l'acquérir
          if (!response.data.locked) {
            await acquireLock();
          } else {
            setHasLock(true);
            currentHasLock = true;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du verrou:', error);
      }
    };

    const acquireLock = async () => {
      try {
        await axios.post(getApiUrl('/api/settings/lock/acquire'), {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasLock(true);
        currentHasLock = true;
        console.log('🔒 Verrou de paramétrage acquis');
      } catch (error) {
        if (error.response?.status === 423) {
          setIsLocked(true);
          setLockInfo(error.response.data);
          setHasLock(false);
        }
      }
    };

    // Vérifier le statut au montage
    checkLockStatus();

    // Renouveler le verrou toutes les 5 minutes
    lockCheckInterval = setInterval(checkLockStatus, 5 * 60 * 1000);

    // Libérer le verrou lors du démontage du composant
    return () => {
      clearInterval(lockCheckInterval);
      if (currentHasLock) {
        axios.post(getApiUrl('/api/settings/lock/release'), {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error('Erreur libération verrou:', err));
      }
    };
  }, [token, navigate]);

  // Charger les paramètres depuis le serveur
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/settings'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        console.log('Paramètres par défaut utilisés');
      }
    };
    fetchSettings();
  }, [token]);

  // Charger tous les utilisateurs pour le test de notifications
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/users'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllUsers(response.data.users || []);
      } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
      }
    };
    fetchUsers();
  }, [token]);

  // Gérer les changements de valeurs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestion du drag and drop pour le logo
  const handleLogoDragStart = (e) => {
    setIsDragging(true);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleLogoDrag = (e) => {
    if (!isDragging || e.clientX === 0 || e.clientY === 0) return;
    
    const container = e.target.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Limiter dans les bords du container
    const maxX = containerRect.width - e.target.offsetWidth;
    const maxY = containerRect.height - e.target.offsetHeight;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    setSettings(prev => ({
      ...prev,
      logoPosition: 'custom',
      logoCustomX: Math.round(clampedX).toString(),
      logoCustomY: Math.round(clampedY).toString()
    }));
  };

  const handleLogoDragEnd = () => {
    setIsDragging(false);
  };

  // Sauvegarder les paramètres
  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      let updatedSettings = { ...settings };
      
      // Si un nouveau logo GJ a été uploadé, l'envoyer d'abord
      if (logoFile) {
        console.log('📤 Upload du logo GJ en cours...');
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        const uploadResponse = await axios.post(getApiUrl('/api/settings/upload-logo'), formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('✅ Logo GJ uploadé:', uploadResponse.data.logoUrl);
        
        // Mettre à jour l'URL du logo dans les settings
        updatedSettings.logoUrl = uploadResponse.data.logoUrl;
        setSettings(updatedSettings);
        setLogoFile(null);
        setLogoPreview('');
      }

      // Si un nouveau logo CRPT a été uploadé, l'envoyer
      if (crptLogoFile) {
        console.log('📤 Upload du logo CRPT en cours...');
        const formData = new FormData();
        formData.append('crptLogo', crptLogoFile);
        
        const uploadResponse = await axios.post(getApiUrl('/api/settings/upload-crpt-logo'), formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('✅ Logo CRPT uploadé:', uploadResponse.data.crptLogoUrl);
        
        // Mettre à jour l'URL du logo CRPT dans les settings
        updatedSettings.crptLogoUrl = uploadResponse.data.crptLogoUrl;
        setSettings(updatedSettings);
        setCrptLogoFile(null);
        setCrptLogoPreview('');
      }

      // Si un nouveau logo PWA a été uploadé, l'envoyer
      if (pwaLogoFile) {
        console.log('📤 Upload du logo PWA en cours...');
        const formData = new FormData();
        formData.append('pwaLogo', pwaLogoFile);
        
        const uploadResponse = await axios.post(getApiUrl('/api/settings/upload-pwa-logo'), formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('✅ Logo PWA uploadé:', uploadResponse.data.pwaLogoUrl);
        
        // Mettre à jour l'URL du logo PWA dans les settings
        updatedSettings.pwaLogoUrl = uploadResponse.data.pwaLogoUrl;
        setSettings(updatedSettings);
        setPwaLogoFile(null);
        setPwaLogoPreview('');
      }
      
      console.log('💾 Sauvegarde des paramètres...');
      await axios.put(getApiUrl('/api/settings'), { settings: updatedSettings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Appliquer les changements immédiatement au CSS
      applySettingsToCSS(updatedSettings);
      
      // Déclencher l'événement pour rafraîchir le logo partout
      console.log('🔄 Rafraîchissement des logos...');
      window.dispatchEvent(new Event('logoUpdated'));
      
      setMessage('✅ Paramètres sauvegardés avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erreur lors de la sauvegarde: ${error.response?.data?.message || error.message}`);
      console.error('❌ Erreur sauvegarde:', error);
      console.error('Détails:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Test de notification OneSignal
  const handleTestNotification = async () => {
    if (!testNotification.title || !testNotification.message) {
      setMessage({ text: '⚠️ Titre et message requis', type: 'error' });
      return;
    }

    setSendingNotification(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post(
        getApiUrl('/api/settings/test-notification'),
        {
          testType: testNotification.testType,
          userId: testNotification.userId,
          title: testNotification.title,
          message: testNotification.message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ text: response.data.message, type: 'success' });
      console.log('✅ Notification envoyée:', response.data);
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
      setMessage({
        text: error.response?.data?.message || 'Erreur lors de l\'envoi',
        type: 'error'
      });
    } finally {
      setSendingNotification(false);
    }
  };

  // Réinitialiser aux valeurs par défaut
  const handleReset = () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      // ✅ Sauvegarder les paramètres du logo avant réinitialisation
      const currentLogoSettings = {
        logoUrl: settings.logoUrl,
        logoWidth: settings.logoWidth,
        logoHeight: settings.logoHeight,
        logoShape: settings.logoShape,
        logoEffect: settings.logoEffect,
        logoAnimation: settings.logoAnimation,
        logoBorderColor: settings.logoBorderColor,
        logoGlowColor: settings.logoGlowColor,
        logoPosition: settings.logoPosition,
        logoCustomX: settings.logoCustomX,
        logoCustomY: settings.logoCustomY,
      };

      setSettings({
        colorPrimary: '#a01e1e',
        colorPrimaryLight: '#e74c3c',
        colorPrimaryDark: '#7a1515',
        colorSecondary: '#d4af37',
        colorGoldLight: '#f3d87c',
        colorGoldDark: '#b8942a',
        colorNavy: '#001a4d',
        fontPrimary: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        fontHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        textBase: '1rem',
        textLg: '1.125rem',
        textXl: '1.25rem',
        text2xl: '1.5rem',
        spaceXs: '0.25rem',
        spaceSm: '0.5rem',
        spaceMd: '1rem',
        spaceLg: '1.5rem',
        spaceXl: '2rem',
        radiusSm: '0.25rem',
        radiusMd: '0.5rem',
        radiusLg: '0.75rem',
        radiusXl: '1rem',
        radius2xl: '1.5rem',
        shadowSm: '0 1px 3px rgba(0, 0, 0, 0.12)',
        shadowMd: '0 4px 12px rgba(0, 0, 0, 0.15)',
        shadowLg: '0 8px 24px rgba(0, 0, 0, 0.2)',
        transitionFast: '150ms',
        transitionBase: '300ms',
        transitionSlow: '500ms',
        darkModeEnabled: false,
        animationsEnabled: true,
        hoverEffectsEnabled: true,
        glassmorphismEnabled: true,
        countdownDate: '2026-08-19T00:00:00',
        countdownTitle: 'Camp GJ dans',
        // ✅ Restaurer les paramètres du logo sauvegardés
        ...currentLogoSettings,
        backgroundType: 'gradient',
        backgroundImage: '',
        backgroundColorStart: '#667eea',
        backgroundColorEnd: '#764ba2',
        backgroundSolidColor: '#ffffff',
        homeBackground: 'default',
        aboutBackground: 'default',
        activitiesBackground: 'default',
        headerStyle: 'gradient',
        headerTextColor: '#ffffff',
        instagramUrl: '',
        facebookUrl: '',
        youtubeUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        carouselEnabled: true,
        carouselHeight: '500px',
        carouselAutoplayInterval: 6000,
        carouselTransitionDuration: 1000,
      });
      setMessage('🔄 Paramètres réinitialisés aux valeurs par défaut (logo préservé)');
    }
  };

  // Appliquer les paramètres au CSS en temps réel
  const applySettingsToCSS = (settings) => {
    const root = document.documentElement;
    
    // Couleurs
    root.style.setProperty('--color-primary', settings.colorPrimary);
    root.style.setProperty('--color-primary-light', settings.colorPrimaryLight);
    root.style.setProperty('--color-primary-dark', settings.colorPrimaryDark);
    root.style.setProperty('--color-secondary', settings.colorSecondary);
    root.style.setProperty('--color-gold-light', settings.colorGoldLight);
    root.style.setProperty('--color-gold-dark', settings.colorGoldDark);
    root.style.setProperty('--color-navy', settings.colorNavy);
    
    // Typographie
    root.style.setProperty('--font-primary', settings.fontPrimary);
    root.style.setProperty('--font-heading', settings.fontHeading);
    root.style.setProperty('--text-base', settings.textBase);
    root.style.setProperty('--text-lg', settings.textLg);
    root.style.setProperty('--text-xl', settings.textXl);
    root.style.setProperty('--text-2xl', settings.text2xl);
    
    // Espacements
    root.style.setProperty('--space-xs', settings.spaceXs);
    root.style.setProperty('--space-sm', settings.spaceSm);
    root.style.setProperty('--space-md', settings.spaceMd);
    root.style.setProperty('--space-lg', settings.spaceLg);
    root.style.setProperty('--space-xl', settings.spaceXl);
    
    // Border Radius
    root.style.setProperty('--radius-sm', settings.radiusSm);
    root.style.setProperty('--radius-md', settings.radiusMd);
    root.style.setProperty('--radius-lg', settings.radiusLg);
    root.style.setProperty('--radius-xl', settings.radiusXl);
    root.style.setProperty('--radius-2xl', settings.radius2xl);
    
    // Ombres
    root.style.setProperty('--shadow-sm', settings.shadowSm);
    root.style.setProperty('--shadow-md', settings.shadowMd);
    root.style.setProperty('--shadow-lg', settings.shadowLg);
    
    // Transitions
    root.style.setProperty('--transition-fast', settings.transitionFast);
    root.style.setProperty('--transition-base', settings.transitionBase);
    root.style.setProperty('--transition-slow', settings.transitionSlow);
    
    // Dark Mode
    if (settings.darkModeEnabled) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Prévisualisation en temps réel
  useEffect(() => {
    applySettingsToCSS(settings);
  }, [settings]);

  // Charger les slides du carrousel
  useEffect(() => {
    const fetchCarouselSlides = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/carousel'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCarouselSlides(response.data.slides || []);
      } catch (error) {
        console.log('Aucun slide de carrousel trouvé');
      }
    };
    fetchCarouselSlides();
  }, [token]);

  // Gérer l'upload d'image carrousel
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setMessage(`❌ Image trop volumineuse ! Maximum : 50MB. Votre image : ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        setTimeout(() => setMessage(''), 5000);
        e.target.value = ''; // Réinitialiser l'input
        return;
      }
      
      setNewSlide(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      
      console.log(`✅ Image sélectionnée : ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  };

  // Appliquer le formatage au texte sélectionné
  const applyFormatting = (type, field = 'description') => {
    const textarea = field === 'description' ? descriptionRef.current : 
                     field === 'description2' ? description2Ref?.current : 
                     description3Ref?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = newSlide[field] || '';
    const selectedText = currentText.substring(start, end);
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);

    let formattedText = '';

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'texte en gras'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'texte en italique'}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText || 'texte souligné'}__`;
        break;
      case 'heading':
        formattedText = `### ${selectedText || 'Titre'}`;
        break;
      case 'bullet':
        formattedText = selectedText
          ? selectedText.split('\n').map(line => `• ${line}`).join('\n')
          : '• Point 1\n• Point 2\n• Point 3';
        break;
      case 'link':
        const url = prompt('Entrez l\'URL du lien :');
        if (url) {
          formattedText = `[${selectedText || 'texte du lien'}](${url})`;
        } else {
          return;
        }
        break;
      default:
        formattedText = selectedText;
    }

    const newText = before + formattedText + after;
    setNewSlide({ ...newSlide, [field]: newText });

    // Remettre le focus sur le textarea
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Convertir le texte formaté en HTML pour l'aperçu
  const formatTextToHTML = (text) => {
    if (!text) return '';

    let html = text;

    // Titres (###)
    html = html.replace(/###\s+(.+)/g, '<h3>$1</h3>');

    // Gras (**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italique (*)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Souligné (__)
    html = html.replace(/__(.+?)__/g, '<u>$1</u>');

    // Liens ([texte](url))
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Listes à puces (•)
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('•')) {
        if (!inList) {
          inList = true;
          return '<ul><li>' + line.replace(/^•\s*/, '') + '</li>';
        }
        return '<li>' + line.replace(/^•\s*/, '') + '</li>';
      } else {
        if (inList) {
          inList = false;
          return '</ul>' + line;
        }
        return line;
      }
    });
    if (inList) processedLines.push('</ul>');
    html = processedLines.join('\n');

    // Retours à la ligne
    html = html.replace(/\n/g, '<br>');

    return html;
  };

  // Fonction pour calculer le positionnement du contenu
  const getContentPositionStyle = (position) => {
    const styles = {
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    };

    switch(position) {
      case 'top':
        styles.justifyContent = 'flex-start';
        break;
      case 'bottom':
        styles.justifyContent = 'flex-end';
        break;
      case 'left':
        styles.alignItems = 'flex-start';
        styles.textAlign = 'left';
        break;
      case 'right':
        styles.alignItems = 'flex-end';
        styles.textAlign = 'right';
        break;
      case 'top-left':
        styles.justifyContent = 'flex-start';
        styles.alignItems = 'flex-start';
        styles.textAlign = 'left';
        break;
      case 'top-right':
        styles.justifyContent = 'flex-start';
        styles.alignItems = 'flex-end';
        styles.textAlign = 'right';
        break;
      case 'bottom-left':
        styles.justifyContent = 'flex-end';
        styles.alignItems = 'flex-start';
        styles.textAlign = 'left';
        break;
      case 'bottom-right':
        styles.justifyContent = 'flex-end';
        styles.alignItems = 'flex-end';
        styles.textAlign = 'right';
        break;
      default:
        break;
    }

    return styles;
  };

  // Ajouter une slide au carrousel
  const handleAddSlide = async () => {
    console.log('🔵 DÉBUT handleAddSlide - Bouton cliqué !');
    console.log('🔵 newSlide:', newSlide);
    console.log('🔵 token:', token ? 'présent' : 'MANQUANT');
    console.log('🔵 user:', user);
    
    if (!newSlide.image) {
      console.log('❌ Pas d\'image sélectionnée');
      setMessage('❌ Veuillez sélectionner une image');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    console.log('📤 Envoi slide:', {
      fileName: newSlide.image.name,
      fileSize: newSlide.image.size,
      fileType: newSlide.image.type,
      title: newSlide.title,
      description: newSlide.description,
      imageSize: newSlide.imageSize,
      page: newSlide.page
    });

    const formData = new FormData();
    formData.append('image', newSlide.image);
    formData.append('title', newSlide.title || '');
    formData.append('description', newSlide.description || '');
    formData.append('description2', newSlide.description2 || '');
    formData.append('description3', newSlide.description3 || '');
    formData.append('order', newSlide.order || carouselSlides.length);
    formData.append('imageSize', newSlide.imageSize || 'cover');
    formData.append('page', newSlide.page || 'home');
    formData.append('overlayOpacity', newSlide.overlayOpacity || 50);
    formData.append('contentPosition', newSlide.contentPosition || 'center');

    console.log('🔑 Token présent:', !!token);
    console.log('👤 Utilisateur role:', user?.role);
    console.log('📦 FormData créé, envoi en cours...');

    try {
      console.log('🚀 Envoi POST /api/carousel...');
      const response = await axios.post(getApiUrl('/api/carousel'), formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Réponse serveur:', response.data);
      
      setCarouselSlides([...carouselSlides, response.data.slide]);
      setNewSlide({ image: null, imagePreview: '', title: '', description: '', description2: '', description3: '', order: 0, imageSize: 'cover', page: 'home', overlayOpacity: 50, contentPosition: 'center' });
      setPreviewSlide(null);
      setMessage('✅ Slide ajoutée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ ERREUR COMPLÈTE:', error);
      console.error('❌ Response:', error.response);
      
      let errorMsg = 'Erreur inconnue';
      
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        const responseText = typeof error.response.data === 'string' ? error.response.data : '';
        
        // Vérifier si c'est une erreur de taille de fichier
        if (responseText.includes('File too large') || responseText.includes('MulterError')) {
          errorMsg = `Image trop volumineuse ! Maximum autorisé : 50MB. Votre image : ${(newSlide.image.size / 1024 / 1024).toFixed(2)}MB`;
        } else {
          errorMsg = error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`;
        }
        
        console.error('❌ Status:', error.response.status);
        console.error('❌ Data:', error.response.data);
        console.error('❌ Headers:', error.response.headers);
      } else if (error.request) {
        // La requête a été envoyée mais pas de réponse
        errorMsg = 'Pas de réponse du serveur. Vérifiez que le backend est démarré.';
        console.error('❌ Request:', error.request);
      } else {
        // Erreur lors de la création de la requête
        errorMsg = error.message;
      }
      
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(''), 7000);
    }
  };

  // Commencer l'édition d'une slide
  const handleEditSlide = (slide) => {
    setEditingSlide({
      ...slide,
      newImage: null,
      imagePreview: `/uploads/${slide.image}`
    });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingSlide(null);
  };

  // Sauvegarder les modifications d'une slide
  const handleUpdateSlide = async () => {
    if (!editingSlide) return;

    try {
      const formData = new FormData();
      
      // Si une nouvelle image a été sélectionnée
      if (editingSlide.newImage) {
        formData.append('image', editingSlide.newImage);
      }
      
      formData.append('title', editingSlide.title);
      formData.append('description', editingSlide.description);
      formData.append('order', editingSlide.order);

      const response = await axios.put(getApiUrl(`/api/carousel/${editingSlide._id}`), formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mettre à jour la liste des slides
      setCarouselSlides(carouselSlides.map(slide => 
        slide._id === editingSlide._id ? response.data.slide : slide
      ));
      
      setEditingSlide(null);
      setMessage('✅ Slide modifiée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
      setMessage(`❌ Erreur lors de la modification: ${errorMsg}`);
      console.error('Erreur modification:', error.response?.data || error);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Gérer le changement d'image lors de l'édition
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingSlide(prev => ({
        ...prev,
        newImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Supprimer une slide
  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette slide ?')) return;

    try {
      await axios.delete(`/api/carousel/${slideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCarouselSlides(carouselSlides.filter(slide => slide._id !== slideId));
      setMessage('✅ Slide supprimée avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression');
      console.error(error);
    }
  };

  // Réorganiser les slides
  const handleReorderSlide = async (slideId, newOrder) => {
    try {
      await axios.put(getApiUrl(`/api/carousel/${slideId}/order`), { order: newOrder }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger les slides
      const response = await axios.get(getApiUrl('/api/carousel'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCarouselSlides(response.data.slides || []);
    } catch (error) {
      console.error('Erreur réorganisation:', error);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Message de verrouillage si la page est verrouillée par un autre admin */}
        {isLocked && lockInfo && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#856404', marginBottom: '10px' }}>
              🔒 Page de paramétrage verrouillée
            </h2>
            <p style={{ color: '#856404', marginBottom: '15px' }}>
              {lockInfo.message}
            </p>
            <p style={{ color: '#856404', fontSize: '14px' }}>
              Le verrou sera automatiquement libéré dans {lockInfo.expiresIn} ou lorsque 
              {' '}{lockInfo.lockedBy} quitte la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#a01e1e',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Rafraîchir la page
            </button>
          </div>
        )}

        {/* Contenu de la page (désactivé si verrouillé) */}
        <div style={{ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}>
          {/* En-tête */}
          <div className="settings-header">
            <h1>⚙️ Paramètres du Site</h1>
            <p className="settings-subtitle">
              Personnalisez l'apparence et le comportement du site GJ Camp
            </p>
            {hasLock && (
              <p style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}>
                ✅ Vous avez le contrôle de cette page
              </p>
            )}
          </div>

          {/* Onglets */}
          <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            🎨 Couleurs
          </button>
          <button
            className={`tab-btn ${activeTab === 'typography' ? 'active' : ''}`}
            onClick={() => setActiveTab('typography')}
          >
            📝 Typographie
          </button>
          <button
            className={`tab-btn ${activeTab === 'spacing' ? 'active' : ''}`}
            onClick={() => setActiveTab('spacing')}
          >
            📏 Espacements
          </button>
          <button
            className={`tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
            onClick={() => setActiveTab('effects')}
          >
            ✨ Effets
          </button>
          <button
            className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            🚀 Avancé
          </button>
          <button
            className={`tab-btn ${activeTab === 'carousel' ? 'active' : ''}`}
            onClick={() => setActiveTab('carousel')}
          >
            🖼️ Carrousel
          </button>
          <button
            className={`tab-btn ${activeTab === 'countdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('countdown')}
          >
            ⏰ Compte à rebours
          </button>
          <button
            className={`tab-btn ${activeTab === 'logo' ? 'active' : ''}`}
            onClick={() => setActiveTab('logo')}
          >
            🎨 Logo
          </button>
          <button
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            🖼️ Apparence
          </button>
          <button
            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            📱 Réseaux sociaux
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="settings-content">
          
          {/* Onglet Couleurs */}
          {activeTab === 'colors' && (
            <div className="settings-section">
              <h2>Palette de Couleurs</h2>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <label>🔴 Rouge Principal (GJ Red)</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorPrimary"
                      value={settings.colorPrimary}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorPrimary}
                      onChange={handleChange}
                      name="colorPrimary"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorPrimary }}></div>
                </div>

                <div className="setting-item">
                  <label>🔥 Rouge Clair</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorPrimaryLight"
                      value={settings.colorPrimaryLight}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorPrimaryLight}
                      onChange={handleChange}
                      name="colorPrimaryLight"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorPrimaryLight }}></div>
                </div>

                <div className="setting-item">
                  <label>🍒 Rouge Foncé</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorPrimaryDark"
                      value={settings.colorPrimaryDark}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorPrimaryDark}
                      onChange={handleChange}
                      name="colorPrimaryDark"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorPrimaryDark }}></div>
                </div>

                <div className="setting-item">
                  <label>🌟 Or/Doré (GJ Gold)</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorSecondary"
                      value={settings.colorSecondary}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorSecondary}
                      onChange={handleChange}
                      name="colorSecondary"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorSecondary }}></div>
                </div>

                <div className="setting-item">
                  <label>✨ Or Clair</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorGoldLight"
                      value={settings.colorGoldLight}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorGoldLight}
                      onChange={handleChange}
                      name="colorGoldLight"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorGoldLight }}></div>
                </div>

                <div className="setting-item">
                  <label>🎖️ Or Foncé</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorGoldDark"
                      value={settings.colorGoldDark}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorGoldDark}
                      onChange={handleChange}
                      name="colorGoldDark"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorGoldDark }}></div>
                </div>

                <div className="setting-item">
                  <label>🌊 Bleu Marine (Header/Footer)</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="colorNavy"
                      value={settings.colorNavy}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      value={settings.colorNavy}
                      onChange={handleChange}
                      name="colorNavy"
                    />
                  </div>
                  <div className="color-preview" style={{ backgroundColor: settings.colorNavy }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Typographie */}
          {activeTab === 'typography' && (
            <div className="settings-section">
              <h2>Typographie</h2>
              
              <div className="settings-grid">
                <div className="setting-item full-width">
                  <label>🅰️ Police Principale</label>
                  <select
                    name="fontPrimary"
                    value={settings.fontPrimary}
                    onChange={handleChange}
                    className="setting-select"
                  >
                    <option value="Segoe UI, Tahoma, Geneva, Verdana, sans-serif">Segoe UI (Par défaut)</option>
                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                    <option value="Georgia, 'Times New Roman', serif">Georgia</option>
                    <option value="'Courier New', Courier, monospace">Courier New</option>
                    <option value="Verdana, Geneva, sans-serif">Verdana</option>
                    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                    <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino</option>
                    <option value="'Lucida Sans', 'Lucida Grande', sans-serif">Lucida Sans</option>
                    <option value="Impact, Charcoal, sans-serif">Impact</option>
                  </select>
                  <p className="setting-hint" style={{ fontFamily: settings.fontPrimary }}>
                    Exemple de texte avec cette police
                  </p>
                </div>

                <div className="setting-item full-width">
                  <label>📖 Police Titres</label>
                  <select
                    name="fontHeading"
                    value={settings.fontHeading}
                    onChange={handleChange}
                    className="setting-select"
                  >
                    <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif">Système (Par défaut)</option>
                    <option value="Georgia, 'Times New Roman', serif">Georgia</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Raleway', sans-serif">Raleway</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Lato', sans-serif">Lato</option>
                    <option value="'Roboto', sans-serif">Roboto</option>
                    <option value="Impact, Charcoal, sans-serif">Impact</option>
                  </select>
                  <h3 className="setting-hint" style={{ fontFamily: settings.fontHeading }}>
                    Exemple de titre avec cette police
                  </h3>
                </div>

                <div className="setting-item">
                  <label>🔤 Taille Base (Body)</label>
                  <select name="textBase" value={settings.textBase} onChange={handleChange} className="setting-select">
                    <option value="0.875rem">Petite (14px)</option>
                    <option value="1rem">Normale (16px - Par défaut)</option>
                    <option value="1.125rem">Grande (18px)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>🔥 Taille Large</label>
                  <select name="textLg" value={settings.textLg} onChange={handleChange} className="setting-select">
                    <option value="1rem">1rem (16px)</option>
                    <option value="1.125rem">1.125rem (18px - Par défaut)</option>
                    <option value="1.25rem">1.25rem (20px)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>🔦 Taille XL</label>
                  <select name="textXl" value={settings.textXl} onChange={handleChange} className="setting-select">
                    <option value="1.125rem">1.125rem (18px)</option>
                    <option value="1.25rem">1.25rem (20px - Par défaut)</option>
                    <option value="1.5rem">1.5rem (24px)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>🔭 Taille 2XL</label>
                  <select name="text2xl" value={settings.text2xl} onChange={handleChange} className="setting-select">
                    <option value="1.25rem">1.25rem (20px)</option>
                    <option value="1.5rem">1.5rem (24px - Par défaut)</option>
                    <option value="1.875rem">1.875rem (30px)</option>
                    <option value="2rem">2rem (32px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Espacements */}
          {activeTab === 'spacing' && (
            <div className="settings-section">
              <h2>Espacements & Dimensions</h2>
              
              <div className="settings-grid">
                <h3 className="section-title">Espacements (Padding/Margin)</h3>
                
                <div className="setting-item">
                  <label>⏸️ Extra Small (XS)</label>
                  <select name="spaceXs" value={settings.spaceXs} onChange={handleChange} className="setting-select">
                    <option value="0.125rem">0.125rem (2px)</option>
                    <option value="0.25rem">0.25rem (4px - Par défaut)</option>
                    <option value="0.375rem">0.375rem (6px)</option>
                  </select>
                  <div className="spacing-preview" style={{ padding: settings.spaceXs, backgroundColor: '#d4af37' }}>
                    Aperçu
                  </div>
                </div>

                <div className="setting-item">
                  <label>Small (SM)</label>
                  <select name="spaceSm" value={settings.spaceSm} onChange={handleChange} className="setting-select">
                    <option value="0.375rem">0.375rem (6px)</option>
                    <option value="0.5rem">0.5rem (8px - Par défaut)</option>
                    <option value="0.75rem">0.75rem (12px)</option>
                  </select>
                  <div className="spacing-preview" style={{ padding: settings.spaceSm, backgroundColor: '#d4af37' }}>
                    Aperçu
                  </div>
                </div>

                <div className="setting-item">
                  <label>Medium (MD)</label>
                  <select name="spaceMd" value={settings.spaceMd} onChange={handleChange} className="setting-select">
                    <option value="0.75rem">0.75rem (12px)</option>
                    <option value="1rem">1rem (16px - Par défaut)</option>
                    <option value="1.25rem">1.25rem (20px)</option>
                  </select>
                  <div className="spacing-preview" style={{ padding: settings.spaceMd, backgroundColor: '#d4af37' }}>
                    Aperçu
                  </div>
                </div>

                <div className="setting-item">
                  <label>Large (LG)</label>
                  <select name="spaceLg" value={settings.spaceLg} onChange={handleChange} className="setting-select">
                    <option value="1.25rem">1.25rem (20px)</option>
                    <option value="1.5rem">1.5rem (24px - Par défaut)</option>
                    <option value="2rem">2rem (32px)</option>
                  </select>
                  <div className="spacing-preview" style={{ padding: settings.spaceLg, backgroundColor: '#d4af37' }}>
                    Aperçu
                  </div>
                </div>

                <div className="setting-item">
                  <label>Extra Large (XL)</label>
                  <select name="spaceXl" value={settings.spaceXl} onChange={handleChange} className="setting-select">
                    <option value="1.5rem">1.5rem (24px)</option>
                    <option value="2rem">2rem (32px - Par défaut)</option>
                    <option value="2.5rem">2.5rem (40px)</option>
                    <option value="3rem">3rem (48px)</option>
                  </select>
                  <div className="spacing-preview" style={{ padding: settings.spaceXl, backgroundColor: '#d4af37' }}>
                    Aperçu
                  </div>
                </div>

                <h3 className="section-title">Border Radius (Coins Arrondis)</h3>
                
                <div className="setting-item">
                  <label>Small (SM)</label>
                  <select name="radiusSm" value={settings.radiusSm} onChange={handleChange} className="setting-select">
                    <option value="0">Aucun (0)</option>
                    <option value="0.125rem">0.125rem (2px)</option>
                    <option value="0.25rem">0.25rem (4px - Par défaut)</option>
                    <option value="0.375rem">0.375rem (6px)</option>
                  </select>
                  <div className="radius-preview" style={{ borderRadius: settings.radiusSm }}></div>
                </div>

                <div className="setting-item">
                  <label>Medium (MD)</label>
                  <select name="radiusMd" value={settings.radiusMd} onChange={handleChange} className="setting-select">
                    <option value="0.25rem">0.25rem (4px)</option>
                    <option value="0.5rem">0.5rem (8px - Par défaut)</option>
                    <option value="0.625rem">0.625rem (10px)</option>
                  </select>
                  <div className="radius-preview" style={{ borderRadius: settings.radiusMd }}></div>
                </div>

                <div className="setting-item">
                  <label>Large (LG)</label>
                  <select name="radiusLg" value={settings.radiusLg} onChange={handleChange} className="setting-select">
                    <option value="0.5rem">0.5rem (8px)</option>
                    <option value="0.75rem">0.75rem (12px - Par défaut)</option>
                    <option value="1rem">1rem (16px)</option>
                  </select>
                  <div className="radius-preview" style={{ borderRadius: settings.radiusLg }}></div>
                </div>

                <div className="setting-item">
                  <label>Extra Large (XL)</label>
                  <select name="radiusXl" value={settings.radiusXl} onChange={handleChange} className="setting-select">
                    <option value="0.75rem">0.75rem (12px)</option>
                    <option value="1rem">1rem (16px - Par défaut)</option>
                    <option value="1.25rem">1.25rem (20px)</option>
                  </select>
                  <div className="radius-preview" style={{ borderRadius: settings.radiusXl }}></div>
                </div>

                <div className="setting-item">
                  <label>2X Large (2XL)</label>
                  <select name="radius2xl" value={settings.radius2xl} onChange={handleChange} className="setting-select">
                    <option value="1rem">1rem (16px)</option>
                    <option value="1.5rem">1.5rem (24px - Par défaut)</option>
                    <option value="2rem">2rem (32px)</option>
                    <option value="9999px">Rond complet</option>
                  </select>
                  <div className="radius-preview" style={{ borderRadius: settings.radius2xl }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Effets */}
          {activeTab === 'effects' && (
            <div className="settings-section">
              <h2>Effets Visuels</h2>
              
              <div className="settings-grid">
                <h3 className="section-title">Ombres (Box Shadow)</h3>
                
                <div className="setting-item full-width">
                  <label>🌑 Ombre Petite (SM)</label>
                  <input
                    type="text"
                    name="shadowSm"
                    value={settings.shadowSm}
                    onChange={handleChange}
                    placeholder="0 1px 3px rgba(0, 0, 0, 0.12)"
                  />
                  <div className="shadow-preview" style={{ boxShadow: settings.shadowSm }}>
                    Aperçu de l'ombre
                  </div>
                </div>

                <div className="setting-item full-width">
                  <label>🌓 Ombre Moyenne (MD)</label>
                  <input
                    type="text"
                    name="shadowMd"
                    value={settings.shadowMd}
                    onChange={handleChange}
                    placeholder="0 4px 12px rgba(0, 0, 0, 0.15)"
                  />
                  <div className="shadow-preview" style={{ boxShadow: settings.shadowMd }}>
                    Aperçu de l'ombre
                  </div>
                </div>

                <div className="setting-item full-width">
                  <label>🌕 Ombre Grande (LG)</label>
                  <input
                    type="text"
                    name="shadowLg"
                    value={settings.shadowLg}
                    onChange={handleChange}
                    placeholder="0 8px 24px rgba(0, 0, 0, 0.2)"
                  />
                  <div className="shadow-preview" style={{ boxShadow: settings.shadowLg }}>
                    Aperçu de l'ombre
                  </div>
                </div>

                <h3 className="section-title">Transitions & Animations</h3>
                
                <div className="setting-item">
                  <label>⚡ Transition Rapide</label>
                  <select name="transitionFast" value={settings.transitionFast} onChange={handleChange} className="setting-select">
                    <option value="100ms">Très rapide (100ms)</option>
                    <option value="150ms">Rapide (150ms - Par défaut)</option>
                    <option value="200ms">Moyenne (200ms)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>🔄 Transition Standard</label>
                  <select name="transitionBase" value={settings.transitionBase} onChange={handleChange} className="setting-select">
                    <option value="200ms">Rapide (200ms)</option>
                    <option value="300ms">Standard (300ms - Par défaut)</option>
                    <option value="400ms">Lente (400ms)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>🐌 Transition Lente</label>
                  <select name="transitionSlow" value={settings.transitionSlow} onChange={handleChange} className="setting-select">
                    <option value="400ms">Moyenne (400ms)</option>
                    <option value="500ms">Lente (500ms - Par défaut)</option>
                    <option value="600ms">Très lente (600ms)</option>
                    <option value="800ms">Ultra lente (800ms)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Avancé */}
          {activeTab === 'advanced' && (
            <div className="settings-section">
              <h2>Paramètres Avancés</h2>
              
              <div className="settings-grid">
                <div className="setting-item toggle-item">
                  <label>
                    <input
                      type="checkbox"
                      name="darkModeEnabled"
                      checked={settings.darkModeEnabled}
                      onChange={handleChange}
                    />
                    <span className="toggle-label">🌙 Mode Sombre</span>
                  </label>
                  <p className="setting-hint">Active le thème sombre pour l'ensemble du site</p>
                </div>

                <div className="setting-item toggle-item">
                  <label>
                    <input
                      type="checkbox"
                      name="animationsEnabled"
                      checked={settings.animationsEnabled}
                      onChange={handleChange}
                    />
                    <span className="toggle-label">✨ Animations</span>
                  </label>
                  <p className="setting-hint">Active les animations et transitions CSS</p>
                </div>

                <div className="setting-item toggle-item">
                  <label>
                    <input
                      type="checkbox"
                      name="hoverEffectsEnabled"
                      checked={settings.hoverEffectsEnabled}
                      onChange={handleChange}
                    />
                    <span className="toggle-label">👆 Effets Hover</span>
                  </label>
                  <p className="setting-hint">Active les effets au survol des éléments</p>
                </div>

                <div className="setting-item toggle-item">
                  <label>
                    <input
                      type="checkbox"
                      name="glassmorphismEnabled"
                      checked={settings.glassmorphismEnabled}
                      onChange={handleChange}
                    />
                    <span className="toggle-label">💎 Glassmorphism</span>
                  </label>
                  <p className="setting-hint">Active les effets de verre (backdrop-filter blur)</p>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Carrousel */}
          {activeTab === 'carousel' && (
            <div className="settings-section">
              <h2>Gestion du Carrousel</h2>
              
              <div className="info-banner">
                <div className="info-icon">ℹ️</div>
                <div className="info-content">
                  <h4>Où apparaissent les images ?</h4>
                  <p>Les images ajoutées ici s'affichent automatiquement dans le <strong>carrousel de la page d'accueil</strong>. Elles remplacent les images par défaut.</p>
                  <p>📍 <strong>Emplacement :</strong> En haut de la page d'accueil (HomePage)</p>
                  <p>🔄 <strong>Actualisation :</strong> Les changements sont visibles immédiatement après rechargement</p>
                </div>
              </div>
              
              {/* Formulaire d'ajout */}
              <div className="carousel-add-section">
                <h3>➕ Ajouter une nouvelle slide</h3>
                
                <div className="carousel-form">
                  <div className="form-group">
                    <label>🖼️ Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    {newSlide.imagePreview && (
                      <div className="image-preview-container">
                        <img src={newSlide.imagePreview} alt="Aperçu" className="image-preview" />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>📝 Titre (optionnel)</label>
                    <input
                      type="text"
                      value={newSlide.title}
                      onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                      placeholder="Titre de la slide..."
                      className="setting-select"
                    />
                  </div>

                  <div className="form-group">
                    <label>📝 Paragraphe / Description</label>
                    
                    {/* Barre d'outils de mise en forme */}
                    <div className="text-editor-toolbar">
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => applyFormatting('bold')}
                        title="Gras"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => applyFormatting('italic')}
                        title="Italique"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => applyFormatting('underline')}
                        title="Souligné"
                      >
                        <u>U</u>
                      </button>
                      <div className="toolbar-separator"></div>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => applyFormatting('heading')}
                        title="Titre"
                      >
                        H
                      </button>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => applyFormatting('bullet')}
                        title="Liste à puces"
                      >
                        •
                      </button>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => applyFormatting('link')}
                        title="Lien"
                      >
                        🔗
                      </button>
                      <div className="toolbar-separator"></div>
                      <button
                        type="button"
                        className="toolbar-btn"
                        onClick={() => setNewSlide({ ...newSlide, description: '' })}
                        title="Effacer"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Zone de texte */}
                    <textarea
                      ref={descriptionRef}
                      value={newSlide.description}
                      onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                      placeholder="Saisissez la description... Utilisez les boutons ci-dessus pour la mise en forme."
                      className="formatted-textarea"
                      rows="6"
                    />

                    {/* Aperçu */}
                    {newSlide.description && (
                      <div className="description-preview">
                        <label>👁️ Aperçu :</label>
                        <div 
                          className="preview-content"
                          dangerouslySetInnerHTML={{ __html: formatTextToHTML(newSlide.description) }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Paragraphe 2 */}
                  <div className="form-group">
                    <label>📝 Paragraphe 2 (optionnel)</label>
                    
                    <div className="text-editor-toolbar">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('bold', 'description2')} title="Gras"><strong>B</strong></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('italic', 'description2')} title="Italique"><em>I</em></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('underline', 'description2')} title="Souligné"><u>U</u></button>
                      <div className="toolbar-separator"></div>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('heading', 'description2')} title="Titre">H</button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('bullet', 'description2')} title="Liste à puces">•</button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('link', 'description2')} title="Lien">🔗</button>
                      <div className="toolbar-separator"></div>
                      <button type="button" className="toolbar-btn" onClick={() => setNewSlide({ ...newSlide, description2: '' })} title="Effacer">🗑️</button>
                    </div>

                    <textarea
                      ref={description2Ref}
                      value={newSlide.description2}
                      onChange={(e) => setNewSlide({ ...newSlide, description2: e.target.value })}
                      placeholder="Saisissez un deuxième paragraphe (optionnel)..."
                      className="formatted-textarea"
                      rows="4"
                    />

                    {newSlide.description2 && (
                      <div className="description-preview">
                        <label>👁️ Aperçu :</label>
                        <div className="preview-content" dangerouslySetInnerHTML={{ __html: formatTextToHTML(newSlide.description2) }} />
                      </div>
                    )}
                  </div>

                  {/* Paragraphe 3 */}
                  <div className="form-group">
                    <label>📝 Paragraphe 3 (optionnel)</label>
                    
                    <div className="text-editor-toolbar">
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('bold', 'description3')} title="Gras"><strong>B</strong></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('italic', 'description3')} title="Italique"><em>I</em></button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('underline', 'description3')} title="Souligné"><u>U</u></button>
                      <div className="toolbar-separator"></div>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('heading', 'description3')} title="Titre">H</button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('bullet', 'description3')} title="Liste à puces">•</button>
                      <button type="button" className="toolbar-btn" onClick={() => applyFormatting('link', 'description3')} title="Lien">🔗</button>
                      <div className="toolbar-separator"></div>
                      <button type="button" className="toolbar-btn" onClick={() => setNewSlide({ ...newSlide, description3: '' })} title="Effacer">🗑️</button>
                    </div>

                    <textarea
                      ref={description3Ref}
                      value={newSlide.description3}
                      onChange={(e) => setNewSlide({ ...newSlide, description3: e.target.value })}
                      placeholder="Saisissez un troisième paragraphe (optionnel)..."
                      className="formatted-textarea"
                      rows="4"
                    />

                    {newSlide.description3 && (
                      <div className="description-preview">
                        <label>👁️ Aperçu :</label>
                        <div className="preview-content" dangerouslySetInnerHTML={{ __html: formatTextToHTML(newSlide.description3) }} />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>🎯 Page de destination</label>
                    <select
                      value={newSlide.page}
                      onChange={(e) => setNewSlide({ ...newSlide, page: e.target.value })}
                      className="setting-select"
                    >
                      <option value="home">🏠 Page d'accueil</option>
                      <option value="about">ℹ️ À propos</option>
                      <option value="activities">🎮 Activités</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>📐 Affichage de l'image</label>
                    <div className="image-size-options">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="imageSize"
                          value="cover"
                          checked={newSlide.imageSize === 'cover'}
                          onChange={(e) => setNewSlide({ ...newSlide, imageSize: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">🖼️</span>
                          <span className="radio-text">
                            <strong>Remplir</strong>
                            <small>L'image remplit tout l'espace (peut être recadrée)</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="imageSize"
                          value="contain"
                          checked={newSlide.imageSize === 'contain'}
                          onChange={(e) => setNewSlide({ ...newSlide, imageSize: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">🔲</span>
                          <span className="radio-text">
                            <strong>Ajuster</strong>
                            <small>L'image complète est visible (peut laisser des marges)</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="imageSize"
                          value="auto"
                          checked={newSlide.imageSize === 'auto'}
                          onChange={(e) => setNewSlide({ ...newSlide, imageSize: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">📏</span>
                          <span className="radio-text">
                            <strong>Taille originale</strong>
                            <small>L'image garde ses proportions d'origine</small>
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Transparence de l'overlay */}
                  <div className="form-group">
                    <label>🎨 Transparence de l'arrière-plan du texte : {newSlide.overlayOpacity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newSlide.overlayOpacity}
                      onChange={(e) => setNewSlide({ ...newSlide, overlayOpacity: parseInt(e.target.value) })}
                      className="opacity-slider"
                    />
                    <div className="opacity-preview" style={{
                      background: `rgba(0,0,0,${newSlide.overlayOpacity / 100})`,
                      color: 'white',
                      padding: '10px',
                      borderRadius: '5px',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}>
                      Aperçu de la transparence ({newSlide.overlayOpacity}%)
                    </div>
                  </div>

                  {/* Positionnement du contenu */}
                  <div className="form-group">
                    <label>📍 Position du contenu sur l'image</label>
                    <div className="image-size-options position-grid">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="top"
                          checked={newSlide.contentPosition === 'top'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">⬆️</span>
                          <span className="radio-text">
                            <strong>Haut</strong>
                            <small>Contenu en haut de l'image</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="center"
                          checked={newSlide.contentPosition === 'center'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">⏺️</span>
                          <span className="radio-text">
                            <strong>Centre</strong>
                            <small>Contenu au centre de l'image</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="bottom"
                          checked={newSlide.contentPosition === 'bottom'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">⬇️</span>
                          <span className="radio-text">
                            <strong>Bas</strong>
                            <small>Contenu en bas de l'image</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="left"
                          checked={newSlide.contentPosition === 'left'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">⬅️</span>
                          <span className="radio-text">
                            <strong>Gauche</strong>
                            <small>Contenu à gauche de l'image</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="right"
                          checked={newSlide.contentPosition === 'right'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">➡️</span>
                          <span className="radio-text">
                            <strong>Droite</strong>
                            <small>Contenu à droite de l'image</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="top-left"
                          checked={newSlide.contentPosition === 'top-left'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">↖️</span>
                          <span className="radio-text">
                            <strong>Haut-Gauche</strong>
                            <small>Contenu en haut à gauche</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="top-right"
                          checked={newSlide.contentPosition === 'top-right'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">↗️</span>
                          <span className="radio-text">
                            <strong>Haut-Droite</strong>
                            <small>Contenu en haut à droite</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="bottom-left"
                          checked={newSlide.contentPosition === 'bottom-left'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">↙️</span>
                          <span className="radio-text">
                            <strong>Bas-Gauche</strong>
                            <small>Contenu en bas à gauche</small>
                          </span>
                        </span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="contentPosition"
                          value="bottom-right"
                          checked={newSlide.contentPosition === 'bottom-right'}
                          onChange={(e) => setNewSlide({ ...newSlide, contentPosition: e.target.value })}
                        />
                        <span className="radio-label">
                          <span className="radio-icon">↘️</span>
                          <span className="radio-text">
                            <strong>Bas-Droite</strong>
                            <small>Contenu en bas à droite</small>
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Aperçu complet de la slide */}
                  {newSlide.imagePreview && (
                    <div className="full-slide-preview">
                      <label>👁️ Aperçu complet de la slide :</label>
                      <button 
                        type="button"
                        className="btn-preview-fullscreen"
                        onClick={() => setPreviewSlide(newSlide)}
                      >
                        🔍 Voir en plein écran
                      </button>
                      <div className="slide-preview-mini">
                        <div 
                          className="slide-preview-image"
                          style={{
                            backgroundImage: `url(${newSlide.imagePreview})`,
                            backgroundSize: newSlide.imageSize === 'contain' ? 'contain' : newSlide.imageSize === 'auto' ? 'auto' : 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          <div 
                            className="slide-preview-overlay" 
                            style={{
                              background: `rgba(0,0,0,${(newSlide.overlayOpacity || 50) / 100})`,
                              ...getContentPositionStyle(newSlide.contentPosition)
                            }}
                          >
                            <div>
                              <h3>{newSlide.title || 'Titre de la slide'}</h3>
                              {newSlide.description && (
                                <div 
                                  className="slide-preview-text"
                                  dangerouslySetInnerHTML={{ __html: formatTextToHTML(newSlide.description) }}
                                />
                              )}
                              {newSlide.description2 && (
                                <div 
                                  className="slide-preview-text"
                                  dangerouslySetInnerHTML={{ __html: formatTextToHTML(newSlide.description2) }}
                                  style={{ marginTop: '10px' }}
                                />
                              )}
                              {newSlide.description3 && (
                                <div 
                                  className="slide-preview-text"
                                  dangerouslySetInnerHTML={{ __html: formatTextToHTML(newSlide.description3) }}
                                  style={{ marginTop: '10px' }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="btn-add-slide" onClick={handleAddSlide}>
                    ➕ Ajouter la slide
                  </button>
                </div>
              </div>

              {/* Liste des slides */}
              <div className="carousel-slides-list">
                <h3>📋 Slides actuelles ({carouselSlides.length})</h3>
                
                {carouselSlides.length === 0 ? (
                  <p className="no-slides">Aucune slide dans le carrousel</p>
                ) : (
                  <div className="slides-grid">
                    {carouselSlides.map((slide, index) => (
                      <div key={slide._id} className="slide-card">
                        {editingSlide && editingSlide._id === slide._id ? (
                          /* Mode Édition */
                          <div className="slide-edit-mode">
                            <div className="edit-header">
                              <h4>✏️ Modification de la slide</h4>
                            </div>

                            {/* Aperçu image */}
                            <div className="slide-image">
                              <img src={editingSlide.imagePreview} alt="Aperçu" />
                            </div>

                            {/* Changer l'image */}
                            <div className="form-group">
                              <label>🖼️ Changer l'image (optionnel)</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                className="file-input"
                              />
                            </div>

                            {/* Titre */}
                            <div className="form-group">
                              <label>📝 Titre</label>
                              <input
                                type="text"
                                value={editingSlide.title}
                                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                                placeholder="Titre de la slide..."
                                className="setting-select"
                              />
                            </div>

                            {/* Description avec éditeur */}
                            <div className="form-group">
                              <label>📝 Paragraphe / Description</label>
                              
                              {/* Barre d'outils */}
                              <div className="text-editor-toolbar">
                                <button type="button" className="toolbar-btn" onClick={() => {
                                  const textarea = descriptionRef.current;
                                  if (!textarea) return;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = editingSlide.description.substring(start, end);
                                  const before = editingSlide.description.substring(0, start);
                                  const after = editingSlide.description.substring(end);
                                  const formatted = `**${selectedText || 'texte en gras'}**`;
                                  setEditingSlide({ ...editingSlide, description: before + formatted + after });
                                }} title="Gras">
                                  <strong>B</strong>
                                </button>
                                <button type="button" className="toolbar-btn" onClick={() => {
                                  const textarea = descriptionRef.current;
                                  if (!textarea) return;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = editingSlide.description.substring(start, end);
                                  const before = editingSlide.description.substring(0, start);
                                  const after = editingSlide.description.substring(end);
                                  const formatted = `*${selectedText || 'texte en italique'}*`;
                                  setEditingSlide({ ...editingSlide, description: before + formatted + after });
                                }} title="Italique">
                                  <em>I</em>
                                </button>
                                <button type="button" className="toolbar-btn" onClick={() => {
                                  const textarea = descriptionRef.current;
                                  if (!textarea) return;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = editingSlide.description.substring(start, end);
                                  const before = editingSlide.description.substring(0, start);
                                  const after = editingSlide.description.substring(end);
                                  const formatted = `__${selectedText || 'texte souligné'}__`;
                                  setEditingSlide({ ...editingSlide, description: before + formatted + after });
                                }} title="Souligné">
                                  <u>U</u>
                                </button>
                                <div className="toolbar-separator"></div>
                                <button type="button" className="toolbar-btn" onClick={() => {
                                  const textarea = descriptionRef.current;
                                  if (!textarea) return;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = editingSlide.description.substring(start, end);
                                  const before = editingSlide.description.substring(0, start);
                                  const after = editingSlide.description.substring(end);
                                  const formatted = `### ${selectedText || 'Titre'}`;
                                  setEditingSlide({ ...editingSlide, description: before + formatted + after });
                                }} title="Titre">
                                  H
                                </button>
                                <button type="button" className="toolbar-btn" onClick={() => {
                                  const textarea = descriptionRef.current;
                                  if (!textarea) return;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const selectedText = editingSlide.description.substring(start, end);
                                  const before = editingSlide.description.substring(0, start);
                                  const after = editingSlide.description.substring(end);
                                  const formatted = selectedText ? selectedText.split('\n').map(line => `• ${line}`).join('\n') : '• Point 1\n• Point 2';
                                  setEditingSlide({ ...editingSlide, description: before + formatted + after });
                                }} title="Liste">
                                  •
                                </button>
                                <button type="button" className="toolbar-btn" onClick={() => setEditingSlide({ ...editingSlide, description: '' })} title="Effacer">
                                  🗑️
                                </button>
                              </div>

                              {/* Zone de texte */}
                              <textarea
                                ref={descriptionRef}
                                value={editingSlide.description}
                                onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                                placeholder="Description..."
                                className="formatted-textarea"
                                rows="6"
                              />

                              {/* Aperçu */}
                              {editingSlide.description && (
                                <div className="description-preview">
                                  <label>👁️ Aperçu :</label>
                                  <div 
                                    className="preview-content"
                                    dangerouslySetInnerHTML={{ __html: formatTextToHTML(editingSlide.description) }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Boutons d'action */}
                            <div className="edit-actions">
                              <button className="btn-save" onClick={handleUpdateSlide}>
                                💾 Sauvegarder
                              </button>
                              <button className="btn-cancel" onClick={handleCancelEdit}>
                                ❌ Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Mode Affichage */
                          <>
                            <div className="slide-image">
                              <img src={`/uploads/${slide.image}`} alt={slide.title || `Slide ${index + 1}`} />
                            </div>
                            <div className="slide-info">
                              <h4>{slide.title || `Slide ${index + 1}`}</h4>
                              {slide.description && (
                                <div 
                                  className="slide-description"
                                  dangerouslySetInnerHTML={{ __html: formatTextToHTML(slide.description) }}
                                />
                              )}
                              <div className="slide-order">
                                <label>🔢 Ordre:</label>
                                <select
                                  value={slide.order}
                                  onChange={(e) => handleReorderSlide(slide._id, parseInt(e.target.value))}
                                  className="order-select"
                                >
                                  {Array.from({ length: carouselSlides.length }, (_, i) => (
                                    <option key={i} value={i}>{i + 1}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="slide-actions">
                              <button
                                className="btn-edit-slide"
                                onClick={() => handleEditSlide(slide)}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-delete-slide"
                                onClick={() => handleDeleteSlide(slide._id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message de feedback */}
        {message && (
          <div className={`settings-message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="settings-actions">
          <button
            className="btn-reset"
            onClick={handleReset}
            disabled={loading}
          >
            🔄 Réinitialiser
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Modal d'aperçu plein écran */}
      {previewSlide && (
        <div className="preview-modal" onClick={() => setPreviewSlide(null)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-modal-close" onClick={() => setPreviewSlide(null)}>
              ❌
            </button>
            <h2>👁️ Aperçu de la slide</h2>
            <div className="preview-modal-slide">
              <div 
                className="preview-modal-image"
                style={{
                  backgroundImage: `url(${previewSlide.imagePreview})`,
                  backgroundSize: previewSlide.imageSize === 'contain' ? 'contain' : previewSlide.imageSize === 'auto' ? 'auto' : 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#000'
                }}
              >
                <div 
                  className="preview-modal-overlay"
                  style={{
                    background: `rgba(0,0,0,${(previewSlide.overlayOpacity || 50) / 100})`,
                    ...getContentPositionStyle(previewSlide.contentPosition)
                  }}
                >
                  <div>
                    <h1>{previewSlide.title || 'Titre de la slide'}</h1>
                    {previewSlide.description && (
                      <div 
                        className="preview-modal-text"
                        dangerouslySetInnerHTML={{ __html: formatTextToHTML(previewSlide.description) }}
                      />
                    )}
                    {previewSlide.description2 && (
                      <div 
                        className="preview-modal-text"
                        dangerouslySetInnerHTML={{ __html: formatTextToHTML(previewSlide.description2) }}
                        style={{ marginTop: '15px' }}
                      />
                    )}
                    {previewSlide.description3 && (
                      <div 
                        className="preview-modal-text"
                        dangerouslySetInnerHTML={{ __html: formatTextToHTML(previewSlide.description3) }}
                        style={{ marginTop: '15px' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-modal-info">
              <p><strong>📐 Affichage :</strong> {
                previewSlide.imageSize === 'cover' ? 'Remplir' : 
                previewSlide.imageSize === 'contain' ? 'Ajuster' : 
                'Taille originale'
              }</p>
              <p><strong>🎯 Page :</strong> {
                previewSlide.page === 'home' ? 'Page d\'accueil' :
                previewSlide.page === 'about' ? 'À propos' :
                'Activités'
              }</p>
              <p><strong>🎨 Transparence :</strong> {previewSlide.overlayOpacity || 50}%</p>
              <p><strong>📍 Position :</strong> {
                previewSlide.contentPosition === 'top' ? 'Haut' :
                previewSlide.contentPosition === 'bottom' ? 'Bas' :
                previewSlide.contentPosition === 'left' ? 'Gauche' :
                previewSlide.contentPosition === 'right' ? 'Droite' :
                previewSlide.contentPosition === 'top-left' ? 'Haut-Gauche' :
                previewSlide.contentPosition === 'top-right' ? 'Haut-Droite' :
                previewSlide.contentPosition === 'bottom-left' ? 'Bas-Gauche' :
                previewSlide.contentPosition === 'bottom-right' ? 'Bas-Droite' :
                'Centre'
              }</p>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Compte à rebours */}
      {activeTab === 'countdown' && (
        <div className="settings-section">
          <h2>⏰ Compte à rebours</h2>
          
          <div className="settings-grid">
            <div className="setting-item full-width">
              <label>📅 Date cible du compte à rebours</label>
              <input
                type="datetime-local"
                name="countdownDate"
                value={settings.countdownDate ? settings.countdownDate.slice(0, 16) : ''}
                onChange={handleChange}
                className="setting-input"
              />
              <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
                Définissez la date et l'heure de fin du compte à rebours
              </small>
            </div>

            <div className="setting-item full-width">
              <label>✏️ Texte d'introduction</label>
              <input
                type="text"
                name="countdownTitle"
                value={settings.countdownTitle}
                onChange={handleChange}
                placeholder="Ex: Camp GJ dans"
                className="setting-input"
              />
              <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
                Le texte qui apparaît avant le compte à rebours
              </small>
            </div>

            {settings.countdownDate && (
              <div className="setting-item full-width">
                <label>👁️ Aperçu du compte à rebours</label>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '10px',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  <div>{settings.countdownTitle || 'Camp GJ dans'}</div>
                  <div style={{ fontSize: '2rem', marginTop: '10px' }}>
                    {(() => {
                      const total = Date.parse(settings.countdownDate) - Date.now();
                      if (total <= 0) return '⏰ Le camp a commencé !';
                      const days = Math.floor(total / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
                      const minutes = Math.floor((total / 1000 / 60) % 60);
                      return `${days}j : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m`;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="btn-save" onClick={handleSave}>
            💾 Enregistrer le compte à rebours
          </button>
        </div>
      )}

      {/* Onglet Logo */}
      {activeTab === 'logo' && (
        <div className="settings-section">
          <h2>🎨 Gestion du Logo</h2>
          
          <div className="settings-grid">
            <div className="setting-item full-width">
              <label>📤 Upload du logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
                className="setting-input"
              />
              <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
                Formats acceptés : PNG, JPG, SVG (recommandé : fond transparent)
              </small>
            </div>

            {(logoPreview || settings.logoUrl) && (
              <div className="setting-item full-width">
                <label>👁️ Aperçu du logo</label>
                <div style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f0f4ff, #fef5ff)',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <img 
                    src={logoPreview || settings.logoUrl} 
                    alt="Logo" 
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="setting-item">
              <label>📏 Largeur du logo</label>
              <select
                name="logoWidth"
                value={settings.logoWidth}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="80px">Petit (80px)</option>
                <option value="100px">Moyen (100px)</option>
                <option value="120px">Normal (120px)</option>
                <option value="150px">Grand (150px)</option>
                <option value="200px">Très grand (200px)</option>
              </select>
            </div>

            <div className="setting-item">
              <label>📐 Hauteur du logo</label>
              <select
                name="logoHeight"
                value={settings.logoHeight}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="auto">Automatique</option>
                <option value="60px">60px</option>
                <option value="80px">80px</option>
                <option value="100px">100px</option>
                <option value="120px">120px</option>
              </select>
            </div>

            <div className="setting-item full-width">
              <h3 style={{ marginTop: '2rem' }}>📍 Position du logo</h3>
            </div>

            <div className="setting-item full-width">
              <label>📌 Emplacement du logo</label>
              <select
                name="logoPosition"
                value={settings.logoPosition}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="header">Dans l'en-tête (par défaut)</option>
                <option value="fixed-top-left">Coin supérieur gauche (fixe)</option>
                <option value="fixed-top-right">Coin supérieur droit (fixe)</option>
                <option value="fixed-bottom-left">Coin inférieur gauche (fixe)</option>
                <option value="fixed-bottom-right">Coin inférieur droit (fixe)</option>
                <option value="custom">Position personnalisée (drag & drop)</option>
              </select>
              <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
                Mode "fixe" : le logo reste visible lors du défilement
              </small>
            </div>

            {settings.logoPosition === 'custom' && (logoPreview || settings.logoUrl) && (
              <div className="setting-item full-width">
                <label>🖱️ Zone de positionnement (glissez-déposez le logo)</label>
                <div 
                  className="logo-drag-container"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                    borderRadius: '12px',
                    border: '2px dashed #667eea',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={logoPreview || settings.logoUrl}
                    alt="Logo draggable"
                    draggable="true"
                    onDragStart={handleLogoDragStart}
                    onDrag={handleLogoDrag}
                    onDragEnd={handleLogoDragEnd}
                    className={`logo-draggable ${isDragging ? 'dragging' : ''} ${settings.logoAnimation}`}
                    style={{
                      position: 'absolute',
                      left: `${settings.logoCustomX}px`,
                      top: `${settings.logoCustomY}px`,
                      width: settings.logoWidth,
                      height: settings.logoHeight,
                      objectFit: 'contain',
                      cursor: 'move',
                      borderRadius: 
                        settings.logoShape === 'circle' ? '50%' :
                        settings.logoShape === 'rounded' ? '12px' :
                        settings.logoShape === 'square' ? '0' :
                        settings.logoShape === 'hexagon' ? '0' : '0',
                      border: 
                        settings.logoEffect === 'border' ? `3px solid ${settings.logoBorderColor}` :
                        settings.logoEffect === 'gradient-border' ? '3px solid transparent' : 'none',
                      boxShadow: 
                        settings.logoEffect === 'shadow' ? '0 8px 24px rgba(0, 0, 0, 0.4)' :
                        settings.logoEffect === 'glow' ? `0 0 20px ${settings.logoGlowColor}` :
                        settings.logoEffect === '3d' ? '5px 5px 15px rgba(0, 0, 0, 0.5), -5px -5px 15px rgba(255, 255, 255, 0.1)' : 'none',
                      transition: isDragging ? 'none' : 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '5px 15px',
                    borderRadius: '20px'
                  }}>
                    Position: X={settings.logoCustomX}px, Y={settings.logoCustomY}px
                  </div>
                </div>
              </div>
            )}

            <div className="setting-item full-width">
              <h3 style={{ marginTop: '2rem' }}>✨ Forme et effets du logo</h3>
            </div>

            <div className="setting-item">
              <label>🔷 Forme du logo</label>
              <select
                name="logoShape"
                value={settings.logoShape}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="none">Aucune (rectangulaire)</option>
                <option value="circle">Cercle</option>
                <option value="rounded">Coins arrondis</option>
                <option value="square">Carré strict</option>
                <option value="hexagon">Hexagone</option>
              </select>
            </div>

            <div className="setting-item">
              <label>✨ Effet visuel</label>
              <select
                name="logoEffect"
                value={settings.logoEffect}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="none">Aucun effet</option>
                <option value="shadow">Ombre portée</option>
                <option value="glow">Lueur</option>
                <option value="border">Bordure simple</option>
                <option value="gradient-border">Bordure dégradé</option>
                <option value="3d">Effet 3D</option>
              </select>
            </div>

            <div className="setting-item">
              <label>🎭 Animation</label>
              <select
                name="logoAnimation"
                value={settings.logoAnimation}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="none">Aucune animation</option>
                <option value="pulse">Pulsation</option>
                <option value="rotate">Rotation au survol</option>
                <option value="bounce">Rebond au survol</option>
                <option value="scale">Zoom au survol</option>
              </select>
            </div>

            {(settings.logoEffect === 'border' || settings.logoEffect === 'gradient-border') && (
              <div className="setting-item">
                <label>🎨 Couleur de bordure</label>
                <input
                  type="color"
                  name="logoBorderColor"
                  value={settings.logoBorderColor}
                  onChange={handleChange}
                  className="setting-input"
                />
              </div>
            )}

            {settings.logoEffect === 'glow' && (
              <div className="setting-item">
                <label>💡 Couleur de lueur</label>
                <input
                  type="color"
                  name="logoGlowColor"
                  value={settings.logoGlowColor}
                  onChange={handleChange}
                  className="setting-input"
                />
              </div>
            )}

            {(logoPreview || settings.logoUrl) && (
              <div className="setting-item full-width">
                <label>👁️ Aperçu avec effets</label>
                <div style={{
                  padding: '3rem',
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <img 
                      src={logoPreview || settings.logoUrl} 
                      alt="Logo avec effets" 
                      className={`logo-preview-with-effects ${settings.logoAnimation}`}
                      style={{
                        width: settings.logoWidth,
                        height: settings.logoHeight,
                        objectFit: 'contain',
                        borderRadius: 
                          settings.logoShape === 'circle' ? '50%' :
                          settings.logoShape === 'rounded' ? '12px' :
                          settings.logoShape === 'square' ? '0' :
                          settings.logoShape === 'hexagon' ? '0' : '0',
                        border: 
                          settings.logoEffect === 'border' ? `3px solid ${settings.logoBorderColor}` :
                          settings.logoEffect === 'gradient-border' ? `3px solid transparent` : 'none',
                        boxShadow: 
                          settings.logoEffect === 'shadow' ? '0 8px 24px rgba(0, 0, 0, 0.4)' :
                          settings.logoEffect === 'glow' ? `0 0 20px ${settings.logoGlowColor}` :
                          settings.logoEffect === '3d' ? '5px 5px 15px rgba(0, 0, 0, 0.5), -5px -5px 15px rgba(255, 255, 255, 0.1)' : 'none',
                        backgroundImage: settings.logoEffect === 'gradient-border' ? `linear-gradient(white, white), linear-gradient(135deg, ${settings.logoBorderColor}, #764ba2)` : 'none',
                        backgroundOrigin: 'border-box',
                        backgroundClip: settings.logoEffect === 'gradient-border' ? 'padding-box, border-box' : 'initial',
                        transform: settings.logoEffect === '3d' ? 'perspective(1000px) rotateY(5deg)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="btn-save" onClick={handleSave}>
            💾 Enregistrer le logo
          </button>
        </div>
      )}

      {/* Gestion du Logo CRPT */}
      {activeTab === 'logo' && (
        <div className="settings-section" style={{ marginTop: '2rem' }}>
          <h2>🏛️ Logo CRPT (Header droite)</h2>
          
          <div className="settings-grid">
            <div className="setting-item full-width">
              <label>📤 Upload du logo CRPT</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setCrptLogoFile(file);
                    setCrptLogoPreview(URL.createObjectURL(file));
                  }
                }}
                className="setting-input"
              />
              <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
                Logo CRPT affiché à droite du header • Formats : PNG, JPG, SVG
              </small>
            </div>

            {(crptLogoPreview || settings.crptLogoUrl) && (
              <div className="setting-item full-width">
                <label>👁️ Aperçu du logo CRPT</label>
                <div style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f0f4ff, #fef5ff)',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <img 
                    src={crptLogoPreview || settings.crptLogoUrl} 
                    alt="Logo CRPT" 
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      borderRadius: '50%',
                      border: '2px solid #d4af37',
                      background: 'white',
                      padding: '3px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <button className="btn-save" onClick={handleSave}>
            💾 Enregistrer le logo CRPT
          </button>
        </div>
      )}

      {/* Gestion du Logo PWA */}
      {activeTab === 'logo' && (
        <div className="settings-section" style={{ marginTop: '2rem' }}>
          <h2>📱 Logo PWA (Application Installée)</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Ce logo s'affichera lorsque les utilisateurs installent l'application sur leur appareil (téléphone, tablette, ordinateur).
          </p>
          
          <div className="settings-grid">
            <div className="setting-item full-width">
              <label>📤 Upload du logo PWA</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPwaLogoFile(file);
                    setPwaLogoPreview(URL.createObjectURL(file));
                  }
                }}
                className="setting-input"
              />
              <small style={{ marginTop: '10px', display: 'block', color: '#666' }}>
                Format recommandé : PNG carré (512x512px minimum) • Sera automatiquement redimensionné en 192x192 et 512x512
              </small>
            </div>

            {(pwaLogoPreview || settings.pwaLogoUrl) && (
              <div className="setting-item full-width">
                <label>👁️ Aperçu du logo PWA</label>
                <div style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem'
                  }}>
                    {/* Aperçu 192x192 */}
                    <div>
                      <img 
                        src={pwaLogoPreview || settings.pwaLogoUrl} 
                        alt="Logo PWA 192" 
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: '20px',
                          border: '2px solid white',
                          background: 'white',
                          padding: '2px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      />
                      <p style={{ marginTop: '0.5rem', color: 'white', fontSize: '0.875rem' }}>
                        192x192
                      </p>
                    </div>

                    {/* Aperçu 512x512 */}
                    <div>
                      <img 
                        src={pwaLogoPreview || settings.pwaLogoUrl} 
                        alt="Logo PWA 512" 
                        style={{
                          width: '128px',
                          height: '128px',
                          borderRadius: '28px',
                          border: '2px solid white',
                          background: 'white',
                          padding: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      />
                      <p style={{ marginTop: '0.5rem', color: 'white', fontSize: '0.875rem' }}>
                        512x512
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ 
                    marginTop: '1.5rem', 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '0.875rem',
                    fontStyle: 'italic'
                  }}>
                    💡 Ce logo apparaîtra sur l'écran d'accueil des utilisateurs après installation
                  </p>
                </div>
              </div>
            )}
          </div>

          <button className="btn-save" onClick={handleSave} disabled={!pwaLogoFile}>
            💾 Enregistrer le logo PWA
          </button>
          
          {!pwaLogoFile && settings.pwaLogoUrl && (
            <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
              ✅ Logo PWA actuel : {settings.pwaLogoUrl}
            </p>
          )}
        </div>
      )}

      {/* Onglet Apparence */}
      {activeTab === 'appearance' && (
        <div className="settings-section">
          <h2>🖼️ Apparence et fonds d'écran</h2>
          
          <div className="settings-grid">
            <div className="setting-item full-width">
              <h3>🎨 Style d'en-tête</h3>
              <label>Type d'arrière-plan en-tête</label>
              <select
                name="headerStyle"
                value={settings.headerStyle}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="gradient">Dégradé</option>
                <option value="solid">Couleur unie</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Couleur du texte en-tête</label>
              <input
                type="color"
                name="headerTextColor"
                value={settings.headerTextColor}
                onChange={handleChange}
                className="setting-input"
              />
            </div>

            <div className="setting-item full-width">
              <h3 style={{ marginTop: '2rem' }}>🌄 Arrière-plan global du site</h3>
              <label>Type d'arrière-plan</label>
              <select
                name="backgroundType"
                value={settings.backgroundType}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="gradient">Dégradé</option>
                <option value="color">Couleur unie</option>
                <option value="image">Image personnalisée</option>
              </select>
            </div>

            {settings.backgroundType === 'gradient' && (
              <>
                <div className="setting-item">
                  <label>Couleur de début</label>
                  <input
                    type="color"
                    name="backgroundColorStart"
                    value={settings.backgroundColorStart}
                    onChange={handleChange}
                    className="setting-input"
                  />
                </div>
                <div className="setting-item">
                  <label>Couleur de fin</label>
                  <input
                    type="color"
                    name="backgroundColorEnd"
                    value={settings.backgroundColorEnd}
                    onChange={handleChange}
                    className="setting-input"
                  />
                </div>
              </>
            )}

            {settings.backgroundType === 'color' && (
              <div className="setting-item">
                <label>Couleur de fond</label>
                <input
                  type="color"
                  name="backgroundSolidColor"
                  value={settings.backgroundSolidColor}
                  onChange={handleChange}
                  className="setting-input"
                />
              </div>
            )}

            <div className="setting-item full-width">
              <h3 style={{ marginTop: '2rem' }}>📄 Arrière-plans par page</h3>
              <label>Page d'accueil</label>
              <select
                name="homeBackground"
                value={settings.homeBackground}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="default">Utiliser le style global</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Page À propos</label>
              <select
                name="aboutBackground"
                value={settings.aboutBackground}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="default">Utiliser le style global</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Page Activités</label>
              <select
                name="activitiesBackground"
                value={settings.activitiesBackground}
                onChange={handleChange}
                className="setting-input"
              >
                <option value="default">Utiliser le style global</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            <div className="setting-item full-width">
              <label>👁️ Aperçu de l'arrière-plan</label>
              <div style={{
                padding: '3rem',
                background: settings.backgroundType === 'gradient' 
                  ? `linear-gradient(135deg, ${settings.backgroundColorStart}, ${settings.backgroundColorEnd})`
                  : settings.backgroundType === 'color'
                  ? settings.backgroundSolidColor
                  : '#f5f5f5',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#333',
                fontSize: '1.2rem'
              }}>
                Aperçu de l'arrière-plan
              </div>
            </div>
          </div>

          <button className="btn-save" onClick={handleSave}>
            💾 Enregistrer l'apparence
          </button>
        </div>
      )}

      {/* Onglet Réseaux sociaux */}
      {activeTab === 'social' && (
        <div className="settings-section">
          <h2>📱 Liens des réseaux sociaux</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Ajoutez les liens complets vers vos pages de réseaux sociaux
          </p>
          
          <div className="settings-grid">
            <div className="setting-item full-width">
              <label>📷 Instagram</label>
              <input
                type="url"
                name="instagramUrl"
                value={settings.instagramUrl}
                onChange={handleChange}
                placeholder="https://www.instagram.com/votre_compte"
                className="setting-input"
              />
            </div>

            <div className="setting-item full-width">
              <label>📘 Facebook</label>
              <input
                type="url"
                name="facebookUrl"
                value={settings.facebookUrl}
                onChange={handleChange}
                placeholder="https://www.facebook.com/votre_page"
                className="setting-input"
              />
            </div>

            <div className="setting-item full-width">
              <label>▶️ YouTube</label>
              <input
                type="url"
                name="youtubeUrl"
                value={settings.youtubeUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/@votre_chaine"
                className="setting-input"
              />
            </div>

            <div className="setting-item full-width">
              <label>🐦 Twitter / X</label>
              <input
                type="url"
                name="twitterUrl"
                value={settings.twitterUrl}
                onChange={handleChange}
                placeholder="https://twitter.com/votre_compte"
                className="setting-input"
              />
            </div>

            <div className="setting-item full-width">
              <label>💼 LinkedIn</label>
              <input
                type="url"
                name="linkedinUrl"
                value={settings.linkedinUrl}
                onChange={handleChange}
                placeholder="https://www.linkedin.com/company/votre_page"
                className="setting-input"
              />
            </div>

            {(settings.instagramUrl || settings.facebookUrl || settings.youtubeUrl || settings.twitterUrl || settings.linkedinUrl) && (
              <div className="setting-item full-width">
                <label>👁️ Aperçu des liens</label>
                <div style={{
                  padding: '20px',
                  background: '#f5f5f5',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem', color: '#E4405F' }}>
                      📷
                    </a>
                  )}
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem', color: '#1877F2' }}>
                      📘
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem', color: '#FF0000' }}>
                      ▶️
                    </a>
                  )}
                  {settings.twitterUrl && (
                    <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem', color: '#1DA1F2' }}>
                      🐦
                    </a>
                  )}
                  {settings.linkedinUrl && (
                    <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '2rem', color: '#0A66C2' }}>
                      💼
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="btn-save" onClick={handleSave}>
            💾 Enregistrer les réseaux sociaux
          </button>
        </div>
      )}

      {/* Section Test Notifications OneSignal */}
      <div className="section-header" onClick={() => setActiveSection(activeSection === 'notifications' ? '' : 'notifications')}>
        <span>🔔 Test Notifications OneSignal</span>
        <span className="toggle-icon">{activeSection === 'notifications' ? '▲' : '▼'}</span>
      </div>

      {activeSection === 'notifications' && (
        <div className="section-content">
          <div className="settings-grid">
            <div className="setting-item full-width">
              <label>🎯 Type de test</label>
              <select
                value={testNotification.testType}
                onChange={(e) => setTestNotification(prev => ({ 
                  ...prev, 
                  testType: e.target.value,
                  userId: e.target.value === 'user' ? prev.userId : ''
                }))}
                className="setting-input"
              >
                <option value="me">📱 Envoyer à moi-même</option>
                <option value="user">👤 Envoyer à un utilisateur</option>
                <option value="all">🌍 Envoyer à tous</option>
              </select>
            </div>

            {testNotification.testType === 'user' && (
              <div className="setting-item full-width">
                <label>👤 Utilisateur cible</label>
                <select
                  value={testNotification.userId}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, userId: e.target.value }))}
                  className="setting-input"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {allUsers.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="setting-item full-width">
              <label>📝 Titre de la notification</label>
              <input
                type="text"
                value={testNotification.title}
                onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="🧪 Test OneSignal"
                className="setting-input"
              />
            </div>

            <div className="setting-item full-width">
              <label>💬 Message</label>
              <textarea
                value={testNotification.message}
                onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Ceci est une notification de test"
                className="setting-input"
                rows="3"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {message.text && (
              <div className={`setting-item full-width message ${message.type}`}>
                <p>{message.text}</p>
              </div>
            )}
          </div>

          <button 
            className="btn-save" 
            onClick={handleTestNotification}
            disabled={sendingNotification}
            style={{ opacity: sendingNotification ? 0.6 : 1 }}
          >
            {sendingNotification ? '⏳ Envoi en cours...' : '🚀 Envoyer la notification'}
          </button>

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(212, 175, 55, 0.1)', 
            borderRadius: '10px',
            borderLeft: '4px solid var(--color-secondary, #d4af37)'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: 'var(--color-secondary, #d4af37)' }}>
              ℹ️ Informations
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Les utilisateurs doivent avoir accepté les notifications</li>
              <li>Seuls les utilisateurs connectés au moins une fois depuis l'installation de OneSignal recevront la notification</li>
              <li>Les notifications apparaissent même si le site est fermé (navigateur ouvert)</li>
              <li>Pour voir vos Player IDs, exécutez: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '3px' }}>node backend/check-player-ids.js</code></li>
            </ul>
          </div>
        </div>
      )}
      </div>
      {/* Fin du div d'opacité pour verrouillage */}
    </div>
  );
};

export default SettingsPage;
