import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/App.css';

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    carouselEnabled: true,
    carouselHeight: '500px',
    carouselAutoplayInterval: 6000,
    carouselTransitionDuration: 1000,
  });

  // Adapter la hauteur et la mise en page sur mobile
  useEffect(() => {
    const applyResponsive = () => {
      const isSmall = window.innerWidth <= 480;
      setSettings(prev => ({
        ...prev,
        carouselHeight: isSmall ? '360px' : (prev.carouselHeight || '500px'),
      }));
    };
    applyResponsive();
    window.addEventListener('resize', applyResponsive);
    return () => window.removeEventListener('resize', applyResponsive);
  }, []);

  // Slides par défaut si l'API ne répond pas
  const defaultSlides = [
    {
      image: '/images/photoTest.jpg',
      title: 'À LA UNE',
      subtitle: 'PLUS DE',
      highlight: 'place',
      subtitle2: 'POUR',
      highlight2: 'EUX',
      description: 'Le camp GJ, des moments inoubliables, de nouvelles rencontres, des instants de partages.',
      date: 'Du 08/08/2026 au 11/08/2026',
      textAnimation: 'fade-up',
      imageAnimation: 'ken-burns',
    },
    {
      image: '/images/photoTest2.jpg',
      title: 'CAMP GJ 2026',
      subtitle: 'UNE EXPÉRIENCE',
      highlight: 'unique',
      subtitle2: 'À VIVRE',
      highlight2: 'ENSEMBLE',
      description: 'Rejoignez-nous pour vivre des moments forts dans la présence de Dieu.',
      date: 'Du 08/08/2026 au 11/08/2026',
      textAnimation: 'slide-left',
      imageAnimation: 'zoom-out',
    },
    {
      image: '/images/photoTest3.jpg',
      title: 'GÉNÉRATION JOSUÉ',
      subtitle: 'DES SOUVENIRS',
      highlight: 'inoubliables',
      subtitle2: 'POUR LA VIE',
      highlight2: '',
      description: 'Une génération puissante et remplie du Saint-Esprit qui fait la différence.',
      date: 'Du 08/08/2026 au 11/08/2026',
      textAnimation: 'zoom-in',
      imageAnimation: 'slide-right',
    },
    {
      image: '/images/_DSC9308.jpg',
      title: 'FELLOWSHIP',
      subtitle: 'VIVEZ L\'EXPÉRIENCE',
      highlight: 'du partage',
      subtitle2: 'ET DE LA',
      highlight2: 'COMMUNION',
      description: 'Rencontrez des jeunes passionnés et engagés dans leur foi.',
      date: 'Du 08/08/2026 au 11/08/2026',
      textAnimation: 'rotate-in',
      imageAnimation: 'fade-scale',
    },
    {
      image: '/images/_DSC9762.jpg',
      title: 'ENSEMBLE',
      subtitle: 'C\'EST',
      highlight: 'meilleur',
      subtitle2: 'C\'EST PLUS',
      highlight2: 'FORT',
      description: 'Partagez des moments inoubliables et des activités fun avec d\'autres jeunes.',
      date: 'Du 08/08/2026 au 11/08/2026',
      textAnimation: 'bounce-in',
      imageAnimation: 'ken-burns',
    },
  ];

  // Charger les slides depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les settings
        const settingsResponse = await axios.get('/api/settings');
        if (settingsResponse.data.settings) {
          setSettings({
            carouselEnabled: settingsResponse.data.settings.carouselEnabled !== undefined 
              ? settingsResponse.data.settings.carouselEnabled 
              : true,
            carouselHeight: settingsResponse.data.settings.carouselHeight || '500px',
            carouselAutoplayInterval: settingsResponse.data.settings.carouselAutoplayInterval || 6000,
            carouselTransitionDuration: settingsResponse.data.settings.carouselTransitionDuration || 1000,
          });
        }

        // Charger les slides
        const slidesResponse = await axios.get('/api/carousel');
        console.log('📡 Réponse API carousel:', slidesResponse.data);
        
        if (slidesResponse.data.slides && slidesResponse.data.slides.length > 0) {
          // Formater les slides de l'API
          const formattedSlides = slidesResponse.data.slides.map(slide => {
            const imagePath = slide.image ? `http://localhost:5000/uploads/${slide.image}` : '/images/placeholder.jpg';
            console.log('🖼️ Image slide:', slide.title, '→', imagePath);
            return {
              image: imagePath,
              title: slide.title || '',
              subtitle: slide.subtitle || '',
              highlight: slide.highlight || '',
              subtitle2: slide.subtitle2 || '',
              highlight2: slide.highlight2 || '',
              description: slide.description || '',
              date: slide.date || '',
              textAnimation: slide.textAnimation || 'fade-up',
              imageAnimation: slide.imageAnimation || 'ken-burns',
            };
          });
          console.log('✅ Slides formatées:', formattedSlides);
          setSlides(formattedSlides);
        } else {
          console.log('⚠️ Aucune slide dans la réponse, utilisation des slides par défaut');
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.log('⚠️ Utilisation des slides par défaut:', error.message);
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convertir le texte formaté en HTML
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

  // Autoplay avec intervalle configurable
  useEffect(() => {
    if (!settings.carouselEnabled || slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, settings.carouselAutoplayInterval);
    
    return () => clearInterval(interval);
  }, [slides.length, settings.carouselEnabled, settings.carouselAutoplayInterval]);

  const handleSlideChange = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), settings.carouselTransitionDuration);
  };

  const goToSlide = (index) => {
    handleSlideChange(index);
  };

  const currentSlideData = slides[currentSlide];
  const textAnimation = currentSlideData?.textAnimation || 'fade-up';
  const imageAnimation = currentSlideData?.imageAnimation || 'ken-burns';

  console.log('🎯 État carrousel:', {
    loading,
    enabled: settings.carouselEnabled,
    slidesCount: slides.length,
    currentSlide,
    currentSlideData
  });

  if (loading) {
    return (
      <div className="carousel-split" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: settings.carouselHeight 
      }}>
        <p>Chargement du carrousel...</p>
      </div>
    );
  }

  if (!settings.carouselEnabled) {
    console.log('⚠️ Carrousel désactivé dans les paramètres');
    return null;
  }

  if (slides.length === 0) {
    console.log('⚠️ Aucune slide à afficher');
    return null;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  return (
    <div
      className="carousel-split"
      style={{
        height: settings.carouselHeight,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: isMobile ? '8px' : undefined,
        paddingBottom: isMobile ? '16px' : undefined,
      }}
    >
      {/* Partie gauche - Texte */}
      <div
        className="carousel-left"
        style={{
          padding: isMobile ? '12px 16px' : undefined,
          zIndex: 2,
        }}
      >
        <div className={`carousel-text-content anim-${textAnimation}`} key={`content-${currentSlide}`}>
          <div className="carousel-tag">
            {currentSlideData?.title || 'À LA UNE'}
          </div>
          
          <div
            className="carousel-headline"
            style={{
              fontSize: isMobile ? '1.05rem' : undefined,
              lineHeight: isMobile ? '1.2' : undefined,
              gap: isMobile ? '2px' : undefined,
              wordBreak: 'break-word',
            }}
          >
            <div className="headline-line headline-line-1">
              <span className="headline-text">{currentSlideData?.subtitle || 'PLUS DE'}</span>
              {currentSlideData?.highlight && (
                <span className="headline-highlight">{currentSlideData.highlight}</span>
              )}
            </div>
            <div className="headline-line headline-line-2">
              <span className="headline-text">{currentSlideData?.subtitle2 || 'POUR'}</span>
              {currentSlideData?.highlight2 && (
                <span className="headline-highlight">{currentSlideData.highlight2}</span>
              )}
            </div>
          </div>

          <p
            className="carousel-description"
            style={{ fontSize: isMobile ? '0.95rem' : undefined }}
          >
            {currentSlideData?.description || 'Rejoignez-nous pour une expérience unique'}
          </p>

          <div className="carousel-date">
            <span className="date-icon">📅</span>
            {currentSlideData?.date || 'Du 08/08/2026 au 11/08/2026'}
          </div>

          <div className="carousel-cta" style={{ marginTop: isMobile ? '10px' : undefined }}>
            <a href="/inscription" className="btn-carousel-primary">
              S'inscrire maintenant
              <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>

        {/* Indicateurs */}
        <div className="carousel-indicators-split">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator-split ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Aller à la slide ${index + 1}`}
            >
              <span className="indicator-line"></span>
            </button>
          ))}
        </div>
      </div>

      {/* Partie droite - Image */}
      <div
        className="carousel-right"
        style={{
          height: isMobile ? '220px' : undefined,
          overflow: 'hidden',
          borderRadius: isMobile ? '12px' : undefined,
          position: 'relative',
        }}
      >
        {/* Overlay dégradé pour améliorer la lisibilité du texte */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: isMobile
              ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)'
              : 'none',
            zIndex: 1,
          }}
        />
        {slides.map((slide, index) => {
          console.log(`🖼️ Rendu slide ${index}:`, slide.image, 'active:', index === currentSlide);
          // Pas d'animation pour la première slide (index 0)
          const imageAnimationClass = index === 0 ? '' : `anim-${slide.imageAnimation || 'ken-burns'}`;
          return (
            <div
              key={index}
              className={`carousel-image-container ${index === currentSlide ? 'active' : ''} ${index === currentSlide - 1 || (currentSlide === 0 && index === slides.length - 1) ? 'prev' : ''}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`carousel-image ${imageAnimationClass}`}
                onError={(e) => {
                  console.error('❌ Erreur chargement image:', slide.image);
                  e.target.src = '/images/placeholder.jpg';
                }}
                onLoad={() => console.log('✅ Image chargée:', slide.image)}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: isMobile ? '220px' : '100%',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
