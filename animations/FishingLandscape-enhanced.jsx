import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- Helper Functions ---

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// --- Sub-Components ---

const SkyGradient = ({ timeOfDay, cloudCover, isStormy }) => {
  const getSkyColors = () => {
    if (isStormy) return ['#2c3e50', '#34495e', '#2c3e50']; 
    if (timeOfDay < 5 || timeOfDay > 20) return ['#0f2027', '#203a43', '#2c5364']; 
    if (timeOfDay >= 5 && timeOfDay < 8) return ['#ff9966', '#ff5e62', '#2c3e50']; 
    if (timeOfDay >= 17 && timeOfDay <= 20) return ['#f12711', '#f5af19', '#2c3e50']; 
    if (cloudCover > 60) return ['#757f9a', '#d7dde8', '#eef2f3']; 
    return ['#2980b9', '#6dd5fa', '#ffffff']; 
  };
  const colors = getSkyColors();
  return (
    <defs>
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} style={{ transition: 'stop-color 1s' }} />
        <stop offset="50%" stopColor={colors[1]} style={{ transition: 'stop-color 1s' }} />
        <stop offset="100%" stopColor={colors[2]} style={{ transition: 'stop-color 1s' }} />
      </linearGradient>
    </defs>
  );
};

const Moon = ({ phase, timeOfDay, cloudCover }) => {
  const opacity = (timeOfDay > 6 && timeOfDay < 18) ? 0.2 : 1;
  const cloudOpacityMod = Math.max(0, 1 - (cloudCover / 100));
  const cx = 800;
  const cy = 100;
  const r = 40;

  const getMoonPath = (phase) => {
    const isLeftShadow = phase < 0.5; 
    const termX = r * Math.cos(phase * 2 * Math.PI);
    return `M ${cx}, ${cy - r} 
            A ${r}, ${r} 0 0,${isLeftShadow ? 0 : 1} ${cx}, ${cy + r} 
            A ${Math.abs(termX)}, ${r} 0 0,${phase < 0.25 || phase > 0.75 ? (isLeftShadow?1:0) : (isLeftShadow?0:1)} ${cx}, ${cy - r}`;
  };

  return (
    <g style={{ opacity: opacity * cloudOpacityMod, transition: 'opacity 1s' }}>
      <circle cx={cx} cy={cy} r={r * 1.5} fill="white" opacity="0.1" />
      <circle cx={cx} cy={cy} r={r} fill="#fdfdff" />
      <path d={getMoonPath(phase)} fill="rgba(20,24,30,0.95)" />
      <circle cx={cx - 10} cy={cy - 5} r={5} fill="rgba(200,200,200,0.1)" />
    </g>
  );
};

const Clouds = ({ cover, windSpeed, windDir }) => {
  const cloudCount = 5;
  const clouds = useMemo(() => Array.from({ length: cloudCount }).map((_, i) => ({
      id: i,
      x: seededRandom(i) * 1000,
      y: 50 + seededRandom(i + 100) * 150,
      scale: 0.5 + seededRandom(i + 200) * 1.5,
      speed: 0.2 + seededRandom(i) * 0.5
    })), []);

  const opacity = Math.min(1, cover / 80);
  const directionMult = (windDir > 180) ? -1 : 1;
  const moveDuration = (105 - windSpeed) * 2;

  if (cover < 5) return null;

  return (
    <g className="clouds" style={{ opacity }}>
      {clouds.map((cloud) => (
        <g key={cloud.id} style={{ 
            transform: `translate(${cloud.x}px, ${cloud.y}px) scale(${cloud.scale})`,
            animation: `float ${moveDuration / cloud.speed}s linear infinite`,
            animationDirection: directionMult > 0 ? 'normal' : 'reverse'
        }}>
          <path d="M25,60.2c-13.8,0-25-11.2-25-25s11.2-25,25-25c2.5,0,4.9,0.4,7.2,1.1c5-10.9,16-18.5,28.7-18.5
            c15.1,0,27.8,10.7,30.6,25.1c2.1-0.6,4.3-0.9,6.6-0.9c13.8,0,25,11.2,25,25s-11.2,25-25,25H25z" 
            fill={cover > 60 ? "#bdc3c7" : "#ecf0f1"} opacity="0.9" />
        </g>
      ))}
      <style>{` @keyframes float { 0% { transform: translateX(-200px); } 100% { transform: translateX(1200px); } } `}</style>
    </g>
  );
};

const Water = ({ tideLevel, windSpeed, landscapeType }) => {
  const yPos = 550 - (tideLevel * 2); 
  const waveHeight = 5 + (windSpeed / 5); 
  const waveSpeed = 20 - (windSpeed / 6);
  
  // Different water colors for different landscape types
  const waterColors = {
    beach: { primary: '#2980b9', secondary: '#3498db' },
    river: { primary: '#27ae60', secondary: '#2ecc71' },
    estuary: { primary: '#7f8c8d', secondary: '#95a5a6' },
    breakwater: { primary: '#16a085', secondary: '#1abc9c' },
    lake: { primary: '#3498db', secondary: '#5dade2' }
  };
  
  const colors = waterColors[landscapeType] || waterColors.beach;

  return (
    <g>
      <path fill={colors.primary} fillOpacity="0.6" d={`M0,${yPos} Q250,${yPos - waveHeight} 500,${yPos} T1000,${yPos} V600 H0 Z`} style={{ animation: `wave ${waveSpeed}s linear infinite` }} />
      <path fill={colors.secondary} fillOpacity="0.8" d={`M0,${yPos + 10} Q250,${yPos + 10 + waveHeight} 500,${yPos + 10} T1000,${yPos + 10} V600 H0 Z`} style={{ animation: `wave ${waveSpeed * 0.8}s linear infinite reverse` }} />
      <style>{` @keyframes wave { 0% { transform: scaleY(1); } 50% { transform: scaleY(1.05); } 100% { transform: scaleY(1); } } `}</style>
    </g>
  );
};

const Rain = ({ intensity, windSpeed, windDir }) => {
  if (intensity < 10) return null;
  const dropCount = Math.floor(intensity * 2);
  const angle = (windDir > 180 ? -1 : 1) * (windSpeed / 4);
  const drops = useMemo(() => Array.from({ length: 100 }).map((_, i) => ({
    id: i, x: Math.random() * 1000, y: Math.random() * 600, len: 10 + Math.random() * 20, speed: 0.5 + Math.random() * 0.5
  })), []);

  return (
    <g className="rain">
      {drops.slice(0, dropCount).map(drop => (
        <line key={drop.id} x1={drop.x} y1={drop.y} x2={drop.x + angle} y2={drop.y + drop.len} stroke="#aaddff" strokeWidth="1" opacity="0.6" style={{ animation: `fall ${1 / drop.speed}s linear infinite` }} />
      ))}
      <style>{` @keyframes fall { 0% { transform: translateY(-600px); } 100% { transform: translateY(600px); } } `}</style>
    </g>
  );
};

const WindIndicator = ({ speed, direction }) => {
  const isBlowingRight = direction >= 0 && direction < 180;
  const lift = 80 - (Math.min(speed, 100) * 0.8);
  const rotation = isBlowingRight ? -lift : lift; 
  const scaleX = isBlowingRight ? 1 : -1;

  return (
    <g transform="translate(850, 480)"> 
      <rect x="-2" y="0" width="4" height="120" fill="#5d4037" />
      <circle cx="0" cy="0" r="3" fill="#3e2723" />
      <g transform={`scale(${scaleX}, 1) rotate(${rotation})`}>
         <path d="M0,-10 L0,10 L15,8 L15,-8 Z" fill="#e67e22" />
         <path d="M15,-8 L15,8 L30,6 L30,-6 Z" fill="#ecf0f1" />
         <path d="M30,-6 L30,6 L45,5 L45,-5 Z" fill="#e67e22" />
         <path d="M45,-5 L45,5 L60,4 L60,-4 Z" fill="#ecf0f1" />
         <path d="M60,-4 L60,4 L90,1 L90,-1 Z" fill="#e67e22" />
         {speed > 20 && (
             <path d="M90,-1 L90,1 L100,0 Z" fill="#e67e22" opacity="0.8">
                <animate attributeName="d" values="M90,-1 L90,1 L100,0 Z; M90,-1 L90,1 L105,5 Z; M90,-1 L90,1 L100,0 Z" dur={`${0.5 - (speed/400)}s`} repeatCount="indefinite" />
             </path>
         )}
      </g>
      <text x="0" y="140" textAnchor="middle" fill="white" fontSize="12" style={{ textShadow: '1px 1px 2px black' }}>
        {speed} km/h {isBlowingRight ? 'E' : 'W'}
      </text>
    </g>
  );
};

// Birds Component
const Birds = ({ landscapeType, timeOfDay }) => {
  const getBirdTypes = () => {
    switch(landscapeType) {
      case 'beach':
      case 'breakwater':
        return ['seagull', 'tern', 'pelican'];
      case 'river':
        return ['swan', 'duck', 'cormorant'];
      case 'estuary':
        return ['heron', 'pelican', 'tern'];
      case 'lake':
        return ['swan', 'duck', 'heron'];
      default:
        return ['seagull'];
    }
  };
  
  const birds = useMemo(() => {
    const types = getBirdTypes();
    return Array.from({ length: 3 }).map((_, i) => ({
      id: i,
      type: types[i % types.length],
      x: 200 + i * 250,
      y: 150 + seededRandom(i) * 100,
      speed: 3 + seededRandom(i + 50) * 2,
      delay: seededRandom(i + 100) * 3
    }));
  }, [landscapeType]);
  
  // Only show birds during day
  if (timeOfDay < 5 || timeOfDay > 20) return null;

  return (
    <g>
      {birds.map((bird) => (
        <g key={bird.id} style={{ 
            transform: `translate(${bird.x}px, ${bird.y}px)`,
            animation: `fly ${bird.speed}s ease-in-out infinite`,
            animationDelay: `${bird.delay}s`
        }}>
          {/* Simple bird silhouette */}
          <path d="M-10,-2 Q-5,-8 0,-2 Q5,-8 10,-2" stroke="#333" strokeWidth="2" fill="none" />
        </g>
      ))}
      <style>{`
        @keyframes fly {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(100px) translateY(-20px); }
          50% { transform: translateX(200px) translateY(0); }
          75% { transform: translateX(100px) translateY(20px); }
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </g>
  );
};

// Tackle Box Component
const TackleBox = ({ onJettyX, onJettyY }) => {
  return (
    <g transform={`translate(${onJettyX - 100}, ${onJettyY + 15})`}>
      {/* Tackle box body */}
      <rect x="0" y="0" width="40" height="25" fill="#4a4a4a" rx="2" />
      <rect x="0" y="0" width="40" height="12" fill="#666" rx="2" />
      
      {/* Handle */}
      <path d="M12,0 Q20,-5 28,0" stroke="#888" strokeWidth="2" fill="none" />
      
      {/* Details */}
      <rect x="5" y="15" width="8" height="8" fill="#e67e22" rx="1" />
      <rect x="16" y="15" width="8" height="8" fill="#27ae60" rx="1" />
      <rect x="27" y="15" width="8" height="8" fill="#3498db" rx="1" />
      
      {/* Latch */}
      <circle cx="20" cy="6" r="2" fill="#ffd700" />
    </g>
  );
};

// Enhanced Fisherman Component
const Fisherman = ({ onJettyX, onJettyY }) => {
  const [state, setState] = useState('idle');

  useEffect(() => {
    const loop = setInterval(() => {
      const roll = Math.random();
      if (roll > 0.85) setState('fishing_jerk');
      else if (roll > 0.65) setState('drinking');
      else if (roll > 0.55) setState('smoking');
      else setState('idle');
    }, 4000);
    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    if (state !== 'idle') {
      const timer = setTimeout(() => setState('idle'), 2500); 
      return () => clearTimeout(timer);
    }
  }, [state]);

  const isJerk = state === 'fishing_jerk';
  const isDrinking = state === 'drinking';
  const isSmoking = state === 'smoking';

  return (
    <g transform={`translate(${onJettyX + 15}, ${onJettyY}) scale(3.5)`}>
       {isJerk && (
          <g transform="translate(-80, 50) scale(1, 0.3)">
             <circle r="10" stroke="white" strokeWidth="0.5" fill="none" opacity="0.8">
                <animate attributeName="r" values="5;30" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
             </circle>
          </g>
       )}

       <g>
          {/* Back Leg */}
          <g transform="translate(1, -1)">
             <path d="M0,0 L-14,0" stroke="#263238" strokeWidth="7" strokeLinecap="round" />
             <g className="leg-swing-offset">
                 <path d="M-14,0 L-14,16" stroke="#263238" strokeWidth="7" strokeLinecap="round" />
                 <path d="M-14,16 L-18,18" stroke="#212121" strokeWidth="5" strokeLinecap="round" />
             </g>
          </g>

          {/* Front Leg */}
          <g>
             <path d="M0,0 L-14,0" stroke="#37474f" strokeWidth="7" strokeLinecap="round" />
             <g className="leg-swing" transform="translate(-14, 0)">
                <path d="M0,0 L0,16" stroke="#37474f" strokeWidth="7" strokeLinecap="round" />
                <path d="M0,16 L-4,18" stroke="#333" strokeWidth="5" strokeLinecap="round" />
             </g>
          </g>

          {/* Torso */}
          <path d="M2,0 L5,-22" stroke="#d35400" strokeWidth="9" strokeLinecap="round" />
          
          {/* Head & Hat */}
          <g transform={isJerk ? "translate(5, -24) rotate(-10)" : "translate(5, -24)"} style={{transition: 'transform 0.2s'}}>
             <circle cx="0" cy="-4" r="7" fill="#ffccbc" />
             <path d="M-6,-8 Q0,-18 6,-8" fill="#455a64" />
             <path d="M-8,-8 L8,-8" stroke="#455a64" strokeWidth="1.5" />
             <circle cx="-5" cy="-4" r="0.5" fill="#333" />
             <path d="M-7,-2 L-5,-2" stroke="#333" strokeWidth="0.5" />

             {isSmoking && (
                <g transform="translate(-7, -1)">
                    <line x1="0" y1="0" x2="-6" y2="1" stroke="white" strokeWidth="1" />
                    <circle cx="-6.5" cy="1.1" r="0.8" fill="red"><animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" /></circle>
                    <circle cx="-8" cy="-2" r="1.5" fill="grey" opacity="0.5"><animate attributeName="cy" values="-2;-10" dur="1s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.5;0" dur="1s" repeatCount="indefinite" /></circle>
                </g>
             )}
          </g>

          {/* RIGHT ARM: Holds rod */}
          <g transform="translate(4, -15)">
             <g transform={isJerk ? "rotate(-10)" : "rotate(0)"} style={{ transition: 'transform 0.1s' }}>
                 <path d="M0,0 L-8,5" stroke="#d35400" strokeWidth="5" strokeLinecap="round" />
                 <path d="M-8,5 L-15,2" stroke="#d35400" strokeWidth="5" strokeLinecap="round" />
                 <line x1="-12" y1="2" x2="-18" y2="0" stroke="#3e2723" strokeWidth="2" />
                 <line x1="-18" y1="0" x2="-80" y2="-20" stroke="#5d4037" strokeWidth="1.5" />
                 <circle cx="-25" cy="-2" r="1.5" fill="#9e9e9e" />
                 <path d={isJerk ? "M-80,-20 L-80,50" : "M-80,-20 Q-80,20 -75,40"} stroke="white" strokeWidth="0.3" fill="none" opacity="0.6" />
             </g>
          </g>

          {/* LEFT ARM */}
          <g transform="translate(5, -15)">
              {isDrinking ? (
                  <g className="arm-drink">
                      <path d="M0,0 L2,4" stroke="#e67e22" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M2,4 L-4,-6" stroke="#e67e22" strokeWidth="4.5" strokeLinecap="round" />
                      <g transform="translate(-6, -8) rotate(-20)">
                          <rect width="4" height="6" fill="#f44336" rx="1" />
                          <rect width="4" height="1" fill="#bdbdbd" y="0" />
                      </g>
                  </g>
              ) : (
                  <g>
                      <path d="M0,0 L2,10" stroke="#e67e22" strokeWidth="4.5" strokeLinecap="round" />
                  </g>
              )}
          </g>

       </g>
       
       <style>{`
         .leg-swing { animation: swing 3s ease-in-out infinite; transform-origin: 0 0; }
         .leg-swing-offset { animation: swing 3s ease-in-out infinite; animation-delay: 0.5s; transform-origin: -14px 0; }
         @keyframes swing { 0% { transform: rotate(-10deg); } 50% { transform: rotate(20deg); } 100% { transform: rotate(-10deg); } }
         .arm-drink { animation: drink-move 2.5s ease-in-out forwards; transform-origin: 0 0; }
         @keyframes drink-move { 
            0% { transform: rotate(0deg); }
            30% { transform: rotate(-10deg); }
            50% { transform: rotate(-15deg); }
            70% { transform: rotate(-10deg); }
            100% { transform: rotate(0deg); }
         }
       `}</style>
    </g>
  );
};

// Landscape-specific backgrounds
const LandscapeBackground = ({ landscapeType, waterY }) => {
  switch(landscapeType) {
    case 'beach':
      return (
        <g>
          {/* Distant mountains */}
          <path d="M0,600 L0,350 L150,200 L350,400 L500,250 L750,420 L1000,280 L1000,600 Z" fill="#8e7cc3" opacity="0.3" />
          {/* Golden sand */}
          <path d={`M0,${waterY} L0,600 L1000,600 L1000,${waterY + 40} Q800,${waterY + 50} 600,${waterY + 45} Q400,${waterY + 40} 200,${waterY + 50} Q100,${waterY + 45} 0,${waterY} Z`} fill="#f4d03f" />
          {/* Sand detail */}
          <path d={`M0,${waterY + 30} Q200,${waterY + 40} 400,${waterY + 35} Q600,${waterY + 30} 800,${waterY + 38} L1000,${waterY + 40} L1000,600 L0,600 Z`} fill="#f39c12" opacity="0.3" />
        </g>
      );
    
    case 'river':
      return (
        <g>
          {/* Distant trees */}
          <path d="M0,600 L0,320 Q100,280 200,300 Q300,320 400,290 Q500,310 600,300 Q700,285 800,310 Q900,295 1000,320 L1000,600 Z" fill="#27ae60" opacity="0.4" />
          {/* Riverbank - green grass */}
          <path d={`M900,${waterY - 20} L1000,${waterY} L1000,600 L900,600 Q920,${waterY + 100} 950,${waterY + 60} Z`} fill="#2ecc71" />
          <path d={`M850,${waterY + 10} L900,${waterY - 20} Q920,${waterY + 20} 950,${waterY + 60} L1000,600 L850,600 Z`} fill="#27ae60" />
          {/* Foreground grass details */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1={900 + i * 5} y1={waterY + 20 + Math.random() * 40} x2={900 + i * 5} y2={waterY + 30 + Math.random() * 50} stroke="#229954" strokeWidth="2" opacity="0.6" />
          ))}
        </g>
      );
    
    case 'estuary':
      return (
        <g>
          {/* Muddy terrain */}
          <path d="M0,600 L0,350 L200,300 L400,380 L600,320 L800,400 L1000,340 L1000,600 Z" fill="#7d6608" opacity="0.4" />
          {/* Marshy banks */}
          <path d={`M900,${waterY} L1000,${waterY + 20} L1000,600 L900,600 Q920,${waterY + 80} 950,${waterY + 50} Z`} fill="#a98" />
          {/* Marsh grass/reeds */}
          {Array.from({ length: 15 }).map((_, i) => (
            <g key={i} transform={`translate(${920 + i * 6}, ${waterY + 30 + Math.random() * 30})`}>
              <line x1="0" y1="0" x2="0" y2={-40 - Math.random() * 20} stroke="#8b7355" strokeWidth="1.5" />
              <circle cx="0" cy={-45 - Math.random() * 20} r="2" fill="#d4a574" />
            </g>
          ))}
        </g>
      );
    
    case 'breakwater':
      return (
        <g>
          {/* Distant shore */}
          <path d="M0,600 L0,380 L300,350 L600,390 L1000,360 L1000,600 Z" fill="#566573" opacity="0.5" />
          {/* Rocky breakwater on right */}
          <g>
            {/* Large rocks */}
            {Array.from({ length: 8 }).map((_, i) => {
              const x = 900 + (i % 3) * 30 - Math.random() * 15;
              const y = waterY + 20 + Math.floor(i / 3) * 25;
              const size = 20 + Math.random() * 15;
              return (
                <ellipse key={i} cx={x} cy={y} rx={size} ry={size * 0.8} fill={i % 2 === 0 ? "#5d6d7e" : "#797d7f"} stroke="#34495e" strokeWidth="1" />
              );
            })}
            {/* Stone texture details */}
            <path d={`M920,${waterY + 50} L950,${waterY + 40} L980,${waterY + 55} L1000,${waterY + 50} L1000,600 L920,600 Z`} fill="#4d5656" />
          </g>
        </g>
      );
    
    case 'lake':
      return (
        <g>
          {/* Distant mountains with treeline */}
          <path d="M0,600 L0,250 L100,200 L200,220 L300,180 L400,210 L500,170 L600,200 L700,160 L800,190 L900,150 L1000,180 L1000,600 Z" fill="#5f6a6a" opacity="0.4" />
          <path d="M0,280 L100,240 L200,260 L300,230 L400,250 L500,220 L600,240 L700,210 L800,230 L900,200 L1000,220 L1000,600 L0,600 Z" fill="#27ae60" opacity="0.3" />
          {/* Grassy bank */}
          <path d={`M900,${waterY - 10} L1000,${waterY + 10} L1000,600 L900,600 Z`} fill="#52be80" />
          <path d={`M920,${waterY + 10} Q940,${waterY + 30} 960,${waterY + 20} T1000,${waterY + 40} L1000,600 L920,600 Z`} fill="#45b39d" />
        </g>
      );
    
    default:
      return null;
  }
};

// Main Landscape Component
const Landscape = ({ data, tideStats, landscapeType = 'beach' }) => {
  const { tide, windSpeed, windDir, rain, clouds, moonPhase, time } = data;
  const isStormy = rain > 60 || clouds > 90;
  const reedBend = (windSpeed / 100) * 30 * ((windDir > 180) ? -1 : 1);
  const waterY = 550 - (tide * 2); 

  return (
    <svg viewBox="0 0 1000 600" className="w-full h-full rounded-lg shadow-2xl bg-gray-900 overflow-hidden" preserveAspectRatio="xMidYMid slice">
      <SkyGradient timeOfDay={time} cloudCover={clouds} isStormy={isStormy} />
      <rect width="100%" height="100%" fill="url(#skyGradient)" />
      <Moon phase={moonPhase} timeOfDay={time} cloudCover={clouds} />
      
      <LandscapeBackground landscapeType={landscapeType} waterY={waterY} />
      
      <Clouds cover={clouds} windSpeed={windSpeed} windDir={windDir} />
      <Birds landscapeType={landscapeType} timeOfDay={time} />
      <Water tideLevel={tide} windSpeed={windSpeed} landscapeType={landscapeType} />
      
      {/* Jetty with improved perspective */}
      <g transform="translate(0, 10)">
        <rect x="750" y="450" width="10" height="200" fill="#5d4037" />
        <rect x="950" y="450" width="10" height="200" fill="#5d4037" />
        <g transform="translate(850, 450)">
            <rect x="0" y="0" width="14" height="200" fill="#4e342e" />
            {[...Array(10)].map((_, i) => <rect key={i} x="2" y={20 + (i * 15)} width="10" height="2" fill="white" opacity="0.5" />)}
            <g transform={`translate(0, ${Math.max(0, waterY - 450)})`}>
                {tideStats.flow !== 0 && (
                     <>
                        <path d={tideStats.flow > 0 ? "M-20,5 L-5,5 M20,5 L35,5" : "M-5,5 L-20,5 M35,5 L20,5"} stroke="white" strokeWidth="2" strokeOpacity="0.6"><animate attributeName="strokeDashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" /></path>
                        <path d={tideStats.flow > 0 ? "M-5,5 L-10,0 M-5,5 L-10,10" : "M-20,5 L-15,0 M-20,5 L-15,10"} stroke="white" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
                     </>
                )}
            </g>
        </g>
        <rect x="700" y="460" width="300" height="20" fill="#795548" />
        <rect x="700" y="450" width="300" height="10" fill="#8d6e63" />
        
        <TackleBox onJettyX={700} onJettyY={460} />
        <Fisherman onJettyX={700} onJettyY={460} />
      </g>
      
      <WindIndicator speed={windSpeed} direction={windDir} />
      
      <Rain intensity={rain} windSpeed={windSpeed} windDir={windDir} />
      {isStormy && rain > 80 && (
          <rect width="100%" height="100%" fill="white" opacity="0">
             <animate attributeName="opacity" values="0;0;0;0.8;0;0" dur="5s" repeatCount="indefinite" begin={`${Math.random()}s`} />
          </rect>
      )}
      
      <g>
          <text x="20" y="40" fill="white" fontFamily="monospace" fontSize="14" style={{ textShadow: '1px 1px 2px black' }}>TIME: {Math.floor(time)}:00 | WIND: {windSpeed}km/h | {landscapeType.toUpperCase()}</text>
          <text x="20" y="60" fill={tideStats.color} fontFamily="monospace" fontSize="14" fontWeight="bold" style={{ textShadow: '1px 1px 2px black' }}>TIDE: {Math.round(tide)}% ({tideStats.status}) {tideStats.arrow}</text>
      </g>
    </svg>
  );
};

// Export for use in main app
window.Landscape = Landscape;

export default Landscape;
