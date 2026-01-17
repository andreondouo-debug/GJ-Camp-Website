/**
 * Configuration par défaut pour la page GJ CRPT
 * Tous les éléments modifiables depuis les paramètres admin
 */

module.exports = {
  // === HERO SECTION ===
  hero: {
    backgroundImage: '/images/crpt-hero-bg.jpg',
    overlayOpacity: 50, // 0-100
    logoUrl: '/images/crpt-logo.png',
    title: 'Christ Refuge Pour Tous',
    titleFontSize: '3.5rem',
    titleColor: '#ffffff',
    titleAnimation: 'fade-in', // 'fade-in', 'slide-up', 'zoom-in', 'none'
    subtitle: 'Une famille d\'églises au service de Dieu et des hommes',
    subtitleFontSize: '1.5rem',
    subtitleColor: '#ffffff',
    
    // Stats du hero
    stats: [
      { number: '5+', label: 'Refuges', icon: '🏛️' },
      { number: '1000+', label: 'Membres', icon: '👥' },
      { number: '15+', label: 'Années', icon: '📅' }
    ],
    statsColor: '#d4af37',
    statsAnimation: 'count-up' // 'count-up', 'fade-in', 'none'
  },

  // === MISSION SECTION ===
  mission: {
    badge: 'Notre Mission',
    badgeColor: '#a01e1e',
    title: 'Qui sommes-nous ?',
    titleFontSize: '2.5rem',
    titleColor: '#1a1a1a',
    
    leadText: 'Christ Refuge Pour Tous (CRPT) est une famille d\'églises évangéliques implantée en France, avec une vision de faire de chaque membre un disciple engagé et un témoin efficace de l\'Évangile.',
    leadTextColor: '#333333',
    leadTextSize: '1.2rem',
    
    bodyText: 'Fondée sur les valeurs bibliques d\'amour, de communion fraternelle et de service, la CRPT s\'engage à être un refuge spirituel pour tous ceux qui cherchent Dieu.',
    bodyTextColor: '#666666',
    bodyTextSize: '1rem',
    
    cardIcon: '🏛️',
    cardTitle: 'Un Refuge pour Tous',
    cardDescription: 'Un lieu d\'accueil, de croissance et d\'impact',
    cardBackgroundColor: '#f8f9fa',
    cardAnimation: 'float' // 'float', 'pulse', 'none'
  },

  // === VALUES SECTION ===
  values: {
    badge: 'Nos Valeurs',
    badgeColor: '#a01e1e',
    title: 'Ce qui nous anime',
    titleFontSize: '2.5rem',
    titleColor: '#1a1a1a',
    
    items: [
      {
        icon: '📖',
        title: 'La Parole de Dieu',
        description: 'La Bible est notre fondement et notre guide pour la vie et la foi.',
        iconColor: '#a01e1e'
      },
      {
        icon: '❤️',
        title: 'L\'Amour',
        description: 'L\'amour de Dieu et du prochain au cœur de notre identité.',
        iconColor: '#d4af37'
      },
      {
        icon: '🙏',
        title: 'La Prière',
        description: 'Nous croyons en la puissance de la prière et de la communion avec Dieu.',
        iconColor: '#a01e1e'
      },
      {
        icon: '🤝',
        title: 'La Communion',
        description: 'Des relations authentiques et une vraie famille spirituelle.',
        iconColor: '#d4af37'
      },
      {
        icon: '🌍',
        title: 'Le Service',
        description: 'Appelés à servir Dieu et notre prochain avec excellence.',
        iconColor: '#a01e1e'
      },
      {
        icon: '🔥',
        title: 'La Louange',
        description: 'Célébrer Sa grandeur dans l\'adoration et la louange.',
        iconColor: '#d4af37'
      }
    ],
    cardBackgroundColor: '#ffffff',
    cardHoverEffect: 'lift-shadow', // 'lift-shadow', 'glow', 'scale', 'none'
    gridColumns: 3 // Nombre de colonnes sur desktop
  },

  // === REFUGES SECTION ===
  refuges: {
    badge: 'Nos Implantations',
    badgeColor: '#a01e1e',
    title: 'Les Refuges CRPT',
    titleFontSize: '2.5rem',
    titleColor: '#1a1a1a',
    subtitle: 'Une présence dans plusieurs villes de France',
    subtitleColor: '#666666',
    
    items: [
      {
        name: 'Lorient',
        region: 'Bretagne',
        description: 'Un refuge dynamique au cœur de la Bretagne',
        icon: '🏛️',
        iconColor: '#a01e1e'
      },
      {
        name: 'Laval',
        region: 'Pays de la Loire',
        description: 'Une communauté chaleureuse et accueillante',
        icon: '🏛️',
        iconColor: '#d4af37'
      },
      {
        name: 'Amiens',
        region: 'Hauts-de-France',
        description: 'Un phare spirituel dans le nord de la France',
        icon: '🏛️',
        iconColor: '#a01e1e',
        address: '15 Rue de la Cathédrale, 80000 Amiens',
        leaderPhoto: '/images/leaders/amiens-leader.jpg',
        leaderName: 'Pasteur Michel Dubois',
        phone: '+33 3 22 12 34 56',
        email: 'amiens@crpt.fr'
      },
      {
        name: 'Nantes',
        region: 'Pays de la Loire',
        description: 'Une église vivante et missionnaire',
        icon: '🏛️',
        iconColor: '#d4af37',
        address: '8 Place Royale, 44000 Nantes',
        leaderPhoto: '/images/leaders/nantes-leader.jpg',
        leaderName: 'Pasteur Claire Rousseau',
        phone: '+33 2 40 12 34 56',
        email: 'nantes@crpt.fr'
      },
      {
        name: 'Paris',
        region: 'Île-de-France',
        description: 'Au cœur de la capitale',
        icon: '🏛️',
        iconColor: '#a01e1e',
        address: '23 Avenue des Champs-Élysées, 75008 Paris',
        leaderPhoto: '/images/leaders/paris-leader.jpg',
        leaderName: 'Pasteur Jean Dupont',
        phone: '+33 1 23 45 67 89',
        email: 'paris@crpt.fr'
      }
    ],
    cardBackgroundColor: '#f8f9fa',
    cardHoverEffect: 'slide-up', // 'slide-up', 'scale', 'glow', 'none'
    gridColumns: 3
  },

  // === GÉNÉRATION JOSUÉ SECTION ===
  generationJosue: {
    badge: 'Notre Jeunesse',
    badgeColor: '#ffffff',
    title: 'Génération Josué',
    titleFontSize: '2.8rem',
    titleColor: '#ffffff',
    leadText: 'Le mouvement jeunesse de la CRPT où les 15-30 ans peuvent grandir dans leur foi et avoir un impact pour le Royaume de Dieu.',
    leadTextColor: '#f0f0f0',
    
    features: [
      { icon: '✨', text: 'Rencontres mensuelles de louange' },
      { icon: '🎤', text: 'Conférences pour jeunes' },
      { icon: '🏕️', text: 'Camp d\'été annuel' },
      { icon: '🤝', text: 'Groupes de prière et d\'étude' },
      { icon: '🎵', text: 'École de musique et louange' }
    ],
    
    buttonText: 'Découvrir Génération Josué',
    buttonLink: '/',
    visualEmoji: '🎯',
    
    backgroundColor: '#667eea',
    gradientColor: '#764ba2'
  },

  // === GENERAL STYLES ===
  styles: {
    pageBackgroundColor: '#ffffff',
    statusBarColor: '#a01e1e',
    headerColor: 'rgba(16, 35, 71, 0.95)',
    footerColor: 'linear-gradient(135deg, rgba(9, 23, 50, 0.98) 0%, rgba(16, 35, 71, 0.95) 70%, rgba(18, 41, 82, 0.92) 100%)',
    primaryColor: '#a01e1e',
    secondaryColor: '#d4af37',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#001a4d',
    
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    borderRadius: '12px',
    cardShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    
    // Animations globales
    enableAnimations: true,
    animationDuration: '0.3s',
    animationEasing: 'ease-in-out',
    
    // Effets
    enableHoverEffects: true,
    enableGlassmorphism: false,
    enableParallax: false
  }
};
