/**
 * Configuration par défaut pour la page Génération Josué (GJ)
 * Ces valeurs sont utilisées si aucun paramètre n'est défini en base de données
 */

module.exports = {
  hero: {
    title: 'Génération Josué',
    subtitle: 'Le mouvement jeunesse où les 15-30 ans peuvent grandir dans leur foi et avoir un impact pour le Royaume de Dieu',
    backgroundImage: '/images/gj-hero-bg.jpg',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overlayOpacity: 0.3,
    logoEnabled: true,
    logoUrl: '/images/logo-gj.png',
    logoSize: '150px'
  },

  generation: {
    enabled: true,
    badge: 'Notre Jeunesse',
    title: 'Génération Josué',
    description: 'Un mouvement dynamique de jeunes passionnés par Dieu, engagés dans leur communauté et déterminés à faire une différence dans le monde.',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    emojiIcon: '🎯',
    buttonText: 'Rejoindre Génération Josué →',
    buttonLink: '/',
    features: [
      {
        icon: '🙏',
        text: 'Des moments de louange puissants'
      },
      {
        icon: '📖',
        text: 'Enseignements bibliques pertinents'
      },
      {
        icon: '🤝',
        text: 'Communauté fraternelle et authentique'
      },
      {
        icon: '🎯',
        text: 'Projets d\'évangélisation et missions'
      },
      {
        icon: '🌟',
        text: 'Développement du leadership'
      }
    ]
  },

  youthGroups: {
    enabled: true,
    badge: 'Nos Groupes',
    title: 'Groupes de Jeunesse par Église',
    subtitle: 'Retrouvez votre groupe de jeunesse près de chez vous et rencontrez vos responsables',
    backgroundColor: '#f8f9fa',
    cardIcon: '🏛️',
    locationIcon: '📍',
    emailIcon: '✉️',
    phoneIcon: '📞',
    leaderTitleSingular: 'Responsable du groupe',
    leaderTitlePlural: 'Responsables du groupe',
    noDataMessage: 'Aucun groupe de jeunesse disponible pour le moment.',
    cardStyle: 'modern',
    showLeaderPhotos: true,
    showContactInfo: true
  },

  cta: {
    enabled: true,
    title: 'Rejoignez-nous !',
    subtitle: 'Trouvez un groupe près de chez vous et faites partie de notre famille',
    buttonText: 'Accéder au tableau de bord',
    buttonLink: '/tableau-de-bord',
    backgroundColor: 'linear-gradient(135deg, #102347 0%, #667eea 100%)',
    textColor: '#ffffff',
    buttonColor: '#d4af37'
  }
};
