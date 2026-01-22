/**
 * Configuration par défaut pour la page Génération Josué (GJ)
 * Ces valeurs sont utilisées si aucun paramètre n'est défini en base de données
 */

module.exports = {
  hero: {
    title: 'Génération Josué',
    subtitle: 'Une génération passionnée pour Christ, engagée dans la mission et transformée par la Parole',
    backgroundImage: '/images/gj-hero-bg.jpg',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overlayOpacity: 0.3,
    logoEnabled: true,
    logoSize: '150px'
  },

  generation: {
    enabled: true,
    title: 'Notre Jeunesse',
    subtitle: 'Une génération qui grandit ensemble',
    description: 'Génération Josué est un mouvement de jeunes passionnés par Christ et engagés dans la mission. Nous croyons en une jeunesse transformée par la Parole de Dieu et engagée à impacter leur génération.',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    features: [
      {
        icon: '📖',
        title: 'Étude biblique',
        description: 'Approfondir notre connaissance de la Parole'
      },
      {
        icon: '🙏',
        title: 'Prière',
        description: 'Développer une vie de prière puissante'
      },
      {
        icon: '🎯',
        title: 'Mission',
        description: 'Partager l\'Évangile avec notre génération'
      },
      {
        icon: '🤝',
        title: 'Communion',
        description: 'Vivre en communauté fraternelle'
      }
    ]
  },

  youthGroups: {
    enabled: true,
    title: 'Nos Groupes de Jeunesse',
    subtitle: 'Retrouvez votre groupe de jeunesse près de chez vous et rencontrez vos responsables',
    backgroundColor: '#f8f9fa',
    cardStyle: 'modern', // 'modern', 'classic', 'minimal'
    showLeaderPhotos: true,
    showContactInfo: true
  },

  cta: {
    enabled: true,
    title: 'Rejoignez-nous !',
    subtitle: 'Envie de faire partie de cette aventure ?',
    buttonText: 'Inscrivez-vous au camp',
    buttonLink: '/inscription',
    backgroundColor: 'linear-gradient(135deg, #102347 0%, #667eea 100%)',
    textColor: '#ffffff',
    buttonColor: '#d4af37'
  }
};
