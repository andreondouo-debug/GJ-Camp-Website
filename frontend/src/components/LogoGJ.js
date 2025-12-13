import React from 'react';

const LogoGJ = ({ size = 'medium' }) => {
  const sizes = {
    small: { width: '60px', height: '60px' },
    medium: { width: '100px', height: '100px' },
    large: { width: '150px', height: '150px' }
  };

  const style = {
    ...sizes[size],
    objectFit: 'contain'
  };

  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {/* Lettre G - bleu foncé */}
      <path
        d="M 30 60 Q 30 40 50 40 L 80 40 L 80 60 L 50 60 Q 40 60 40 70 L 40 120 Q 40 130 50 130 L 80 130 L 80 150 Q 80 160 60 160 L 40 160 Q 20 160 20 140 L 20 60 Q 20 40 40 40"
        fill="#001a4d"
      />
      
      {/* Lettre J - bleu foncé */}
      <path
        d="M 140 40 L 160 40 L 160 120 Q 160 145 140 145 Q 120 145 120 125 L 130 125 Q 130 135 140 135 Q 150 135 150 120 L 150 60 L 140 60 Z"
        fill="#001a4d"
      />

      {/* Croix dorée au centre */}
      {/* Barre verticale */}
      <rect x="85" y="45" width="30" height="100" fill="#d4af37" rx="4" />
      
      {/* Barre horizontale */}
      <rect x="75" y="80" width="50" height="20" fill="#d4af37" rx="4" />

      {/* Poignée de croix (haut) */}
      <circle cx="100" cy="35" r="8" fill="#d4af37" />
      <circle cx="100" cy="35" r="5" fill="#ffd700" />

      {/* Petits détails dorés sur la croix */}
      <circle cx="85" cy="85" r="4" fill="#ffd700" />
      <circle cx="115" cy="85" r="4" fill="#ffd700" />

      {/* Texte "GENERATION JOSUE" */}
      <text
        x="100"
        y="190"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#001a4d"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        GENERATION JOSUE
      </text>
    </svg>
  );
};

export default LogoGJ;
