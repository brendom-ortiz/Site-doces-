
import React from 'react';

interface Props {
  size?: number;
}

const BrigadeiroLogo: React.FC<Props> = ({ size = 64 }) => {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <style>
        {`
          @keyframes gourmet-float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          @keyframes eye-blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          @keyframes gloss-shimmer {
            0% { opacity: 0.3; transform: translateX(-10px) translateY(-10px); }
            50% { opacity: 0.8; transform: translateX(5px) translateY(5px); }
            100% { opacity: 0.3; transform: translateX(-10px) translateY(-10px); }
          }
          @keyframes pulse-soft {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.02); filter: brightness(1.15); }
          }
          .animate-gourmet {
            animation: gourmet-float 4s ease-in-out infinite;
          }
          .animate-blink {
            animation: eye-blink 5s infinite;
            transform-origin: center;
          }
          .animate-gloss {
            animation: gloss-shimmer 3s ease-in-out infinite;
          }
          .animate-pulse-soft {
            animation: pulse-soft 3.5s ease-in-out infinite;
          }
        `}
      </style>
      
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_20px_30px_rgba(20,60,30,0.15)] animate-gourmet"
      >
        <defs>
          <radialGradient id="chocolateDepth" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#5D3A2D" />
            <stop offset="70%" stopColor="#3C1E14" />
            <stop offset="100%" stopColor="#2A120B" />
          </radialGradient>
          
          <filter id="softGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Forminha Rosa */}
        <path
          d="M25,75 L75,75 L68,92 Q50,96 32,92 Z"
          fill="#FBCFE8"
        />
        <path
          d="M22,75 Q50,68 78,75 L82,75 Q85,75 80,80 Q75,85 75,75 M22,75 Q15,75 18,80 Q25,85 25,75"
          fill="none"
          stroke="#F472B6"
          strokeWidth="1.5"
        />

        {/* Corpo do Brigadeiro */}
        <circle cx="50" cy="50" r="38" fill="url(#chocolateDepth)" className="animate-pulse-soft" />

        {/* Brilhos */}
        <ellipse cx="35" cy="30" rx="10" ry="5" fill="white" fillOpacity="0.15" transform="rotate(-30 35 30)" className="animate-gloss" />
        <circle cx="65" cy="25" r="3" fill="white" fillOpacity="0.2" className="animate-gloss" style={{ animationDelay: '1.5s' }} />

        {/* Granulados Rosa e Verde */}
        <g opacity="0.9">
          <rect x="45" y="15" width="10" height="4" rx="2" fill="#F472B6" transform="rotate(15 50 17)" />
          <rect x="20" y="40" width="8" height="4" rx="2" fill="#34D399" transform="rotate(-40 24 42)" />
          <rect x="70" y="35" width="12" height="4" rx="2" fill="#F472B6" transform="rotate(80 76 37)" />
          <rect x="40" y="30" width="6" height="3" rx="1.5" fill="#10B981" />
          <rect x="60" y="60" width="10" height="4" rx="2" fill="#F472B6" transform="rotate(-15 65 62)" />
          <rect x="30" y="65" width="12" height="4" rx="2" fill="#34D399" transform="rotate(45 36 67)" />
        </g>

        {/* Rosto Minimalista */}
        <g>
          <g className="animate-blink">
            <circle cx="38" cy="52" r="4.5" fill="#1A0A05" />
            <circle cx="39.5" cy="50.5" r="1.5" fill="white" fillOpacity="0.7" />
            <circle cx="62" cy="52" r="4.5" fill="#1A0A05" />
            <circle cx="63.5" cy="50.5" r="1.5" fill="white" fillOpacity="0.7" />
          </g>
          
          <path
            d="M45,64 Q50,69 55,64"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Bochechas Rosadas */}
          <circle cx="28" cy="62" r="5" fill="#F472B6" fillOpacity="0.4" filter="url(#softGlow)" />
          <circle cx="72" cy="62" r="5" fill="#F472B6" fillOpacity="0.4" filter="url(#softGlow)" />
        </g>
      </svg>
    </div>
  );
};

export default BrigadeiroLogo;