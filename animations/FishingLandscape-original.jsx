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
        <stop offset="0%" stopColor={colors[0]} transition="stop-color 1s" />
        <stop offset="50%" stopColor={colors[1]} transition="stop-color 1s" />
        <stop offset="100%" stopColor={colors[2]} transition="stop-color 1s" />
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
      <circle cx={cx} cy={cy} r={r * 1.5} fill="white" opacity="0.1" filter="blur(10px)" />
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

const Water = ({ tideLevel, windSpeed }) => {
  const yPos = 550 - (tideLevel * 2); 
  const waveHeight = 5 + (windSpeed / 5); 
  const waveSpeed = 20 - (windSpeed / 6);

  return (
    <g>
      <path fill="#2980b9" fillOpacity="0.6" d={`M0,${yPos} Q250,${yPos - waveHeight} 500,${yPos} T1000,${yPos} V600 H0 Z`} style={{ animation: `wave ${waveSpeed}s linear infinite` }} />
      <path fill="#3498db" fillOpacity="0.8" d={`M0,${yPos + 10} Q250,${yPos + 10 + waveHeight} 500,${yPos + 10} T1000,${yPos + 10} V600 H0 Z`} style={{ animation: `wave ${waveSpeed * 0.8}s linear infinite reverse` }} />
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
    <g transform={`translate(${onJettyX}, ${onJettyY}) scale(3.2)`}>
       {isJerk && (
          <g transform="translate(-80, 50) scale(1, 0.3)">
             <circle r="10" stroke="white" strokeWidth="0.5" fill="none" opacity="0.8">
                <animate attributeName="r" values="5;30" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
             </circle>
          </g>
       )}

       <g>
          {/* Back Leg (Right) */}
          <g transform="translate(1, -1)">
             <path d="M0,0 L-14,0" stroke="#263238" strokeWidth="7" strokeLinecap="round" />
             <g className="leg-swing-offset">
                 <path d="M-14,0 L-14,16" stroke="#263238" strokeWidth="7" strokeLinecap="round" />
                 <path d="M-14,16 L-18,18" stroke="#212121" strokeWidth="5" strokeLinecap="round" />
             </g>
          </g>

          {/* Front Leg (Left) */}
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

          {/* RIGHT ARM: Always holds the rod */}
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

          {/* LEFT ARM (Free arm for drinking) */}
          <g transform="translate(5, -15)">
              {isDrinking ? (
                  <g className="arm-drink">
                      {/* Upper arm */}
                      <path d="M0,0 L2,4" stroke="#e67e22" strokeWidth="4.5" strokeLinecap="round" />
                      {/* Forearm bending towards face */}
                      <path d="M2,4 L-4,-6" stroke="#e67e22" strokeWidth="4.5" strokeLinecap="round" />
                      {/* Drink Can */}
                      <g transform="translate(-6, -8) rotate(-20)">
                          <rect width="4" height="6" fill="#f44336" rx="1" />
                          <rect width="4" height="1" fill="#bdbdbd" y="0" />
                      </g>
                  </g>
              ) : (
                  <g>
                      {/* Resting arm */}
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

const Landscape = ({ data, tideStats }) => {
  const { tide, windSpeed, windDir, rain, clouds, moonPhase, time } = data;
  const isStormy = rain > 60 || clouds > 90;
  const reedBend = (windSpeed / 100) * 30 * ((windDir > 180) ? -1 : 1);
  const waterY = 550 - (tide * 2); 

  return (
    <svg viewBox="0 0 1000 600" className="w-full h-full rounded-lg shadow-2xl bg-gray-900 overflow-hidden" preserveAspectRatio="xMidYMid slice">
      <SkyGradient timeOfDay={time} cloudCover={clouds} isStormy={isStormy} />
      <rect width="100%" height="100%" fill="url(#skyGradient)" />
      <Moon phase={moonPhase} timeOfDay={time} cloudCover={clouds} />
      <path d="M0,600 L0,300 L150,150 L350,350 L500,200 L750,400 L1000,200 L1000,600 Z" fill="#2c3e50" opacity="0.3" />
      <path d="M0,600 L0,400 L200,250 L400,450 L600,300 L900,450 L1000,350 L1000,600 Z" fill="#34495e" opacity="0.5" />
      <path d="M800,600 L850,550 L1000,520 L1000,600 Z" fill="#1b2631" opacity="0.8" />
      <Clouds cover={clouds} windSpeed={windSpeed} windDir={windDir} />
      <Water tideLevel={tide} windSpeed={windSpeed} />
      <g transform="translate(0, 10)">
        <rect x="750" y="450" width="10" height="200" fill="#5d4037" />
        <rect x="950" y="450" width="10" height="200" fill="#5d4037" />
        <g transform="translate(850, 450)">
            <rect x="0" y="0" width="14" height="200" fill="#4e342e" />
            {[...Array(10)].map((_, i) => <rect key={i} x="2" y={20 + (i * 15)} width="10" height="2" fill="white" opacity="0.5" />)}
            <g transform={`translate(0, ${Math.max(0, waterY - 450)})`}>
                {tideStats.flow !== 0 && (
                     <>
                        <path d={tideStats.flow > 0 ? "M-20,5 L-5,5 M20,5 L35,5" : "M-5,5 L-20,5 M35,5 L20,5"} stroke="white" strokeWidth="2" strokeOpacity="0.6"><animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" /></path>
                        <path d={tideStats.flow > 0 ? "M-5,5 L-10,0 M-5,5 L-10,10" : "M-20,5 L-15,0 M-20,5 L-15,10"} stroke="white" strokeWidth="2" strokeOpacity="0.8" fill="none"/>
                     </>
                )}
            </g>
        </g>
        <rect x="700" y="460" width="300" height="20" fill="#795548" />
        <rect x="700" y="450" width="300" height="10" fill="#8d6e63" />
        <Fisherman onJettyX={700} onJettyY={460} />
      </g>
      <WindIndicator speed={windSpeed} direction={windDir} />
      <g transform={`translate(100, 580) rotate(${reedBend}, 0, 20)`} style={{ transition: 'transform 1s ease-out' }}>
         <path d="M0,20 Q-5,-50 0,-100" stroke="#558b2f" strokeWidth="3" fill="none" />
         <path d="M10,20 Q5,-40 10,-80" stroke="#689f38" strokeWidth="2" fill="none" />
      </g>
      <g transform={`translate(250, 600) rotate(${reedBend * 0.8}, 0, 20)`} style={{ transition: 'transform 1s ease-out' }}>
         <path d="M0,0 Q5,-60 10,-120" stroke="#558b2f" strokeWidth="4" fill="none" />
         <path d="M20,0 Q25,-50 30,-90" stroke="#7cb342" strokeWidth="3" fill="none" />
      </g>
      <Rain intensity={rain} windSpeed={windSpeed} windDir={windDir} />
      {isStormy && rain > 80 && (
          <rect width="100%" height="100%" fill="white" opacity="0">
             <animate attributeName="opacity" values="0;0;0;0.8;0;0" dur="5s" repeatCount="indefinite" begin={`${Math.random()}s`} />
          </rect>
      )}
      <g>
          <text x="20" y="40" fill="white" fontFamily="monospace" fontSize="14" style={{ textShadow: '1px 1px 2px black' }}>TIME: {Math.floor(time)}:00 | WIND: {windSpeed}km/h</text>
          <text x="20" y="60" fill={tideStats.color} fontFamily="monospace" fontSize="14" fontWeight="bold" style={{ textShadow: '1px 1px 2px black' }}>TIDE: {tide}% ({tideStats.status}) {tideStats.arrow}</text>
      </g>
    </svg>
  );
};

export default function App() {
  const [data, setData] = useState({ time: 14, tide: 50, windSpeed: 15, windDir: 90, rain: 0, clouds: 20, moonPhase: 0.25 });
  const prevTide = useRef(50);
  const [tideDirection, setTideDirection] = useState(0); 

  useEffect(() => {
    if (data.tide > prevTide.current) setTideDirection(1);
    else if (data.tide < prevTide.current) setTideDirection(-1);
    else setTideDirection(0);
    prevTide.current = data.tide;
  }, [data.tide]);

  const tideStats = useMemo(() => {
     let status = "Mid";
     if (data.tide > 80) status = "High";
     if (data.tide < 20) status = "Low";
     let dirText = "Still"; let arrow = "-"; let color = "white";
     if (tideDirection === 1) { dirText = "Incoming"; arrow = "↑"; color = "#4fc3f7"; }
     if (tideDirection === -1) { dirText = "Outgoing"; arrow = "↓"; color = "#ff8a65"; }
     return { status, dirText, arrow, color, flow: tideDirection, fullText: `${status} - ${dirText}` };
  }, [data.tide, tideDirection]);

  const handleChange = (key, value) => setData(prev => ({ ...prev, [key]: parseFloat(value) }));

  const setPreset = (type) => {
    switch(type) {
        case 'storm': setData({ ...data, time: 16, clouds: 95, rain: 90, windSpeed: 80, windDir: 200 }); break;
        case 'calm_night': setData({ ...data, time: 23, clouds: 5, rain: 0, windSpeed: 5, windDir: 45, moonPhase: 0.5, tide: 80 }); break;
        case 'sunny_day': setData({ ...data, time: 12, clouds: 10, rain: 0, windSpeed: 10, windDir: 90, tide: 20 }); break;
        default: break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-4 font-sans">
      <div className="w-full max-w-4xl mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-sky-400">Fishing Spot Digital Twin</h1>
            <p className="text-sm text-slate-400">Reactive Vector Visualization</p>
          </div>
          <div className="space-x-2">
              <button onClick={() => setPreset('sunny_day')} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold transition">Sunny</button>
              <button onClick={() => setPreset('storm')} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs font-bold transition">Storm</button>
              <button onClick={() => setPreset('calm_night')} className="px-3 py-1 bg-indigo-900 hover:bg-indigo-800 rounded text-xs font-bold transition">Night</button>
          </div>
      </div>
      <div className="w-full max-w-4xl aspect-[5/3] bg-black rounded-xl border border-slate-700 shadow-2xl relative">
        <Landscape data={data} tideStats={tideStats} />
      </div>
      <div className="w-full max-w-4xl mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="space-y-4">
            <h3 className="font-bold text-sky-400 border-b border-slate-600 pb-1">Environment</h3>
            <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Time ({data.time}:00)</label><input type="range" min="0" max="24" value={data.time} onChange={(e) => handleChange('time', e.target.value)} className="accent-sky-500" /></div>
            <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Tide ({data.tide}%)</label><input type="range" min="0" max="100" value={data.tide} onChange={(e) => handleChange('tide', e.target.value)} className="accent-blue-500" /></div>
        </div>
        <div className="space-y-4">
            <h3 className="font-bold text-sky-400 border-b border-slate-600 pb-1">Wind</h3>
            <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Speed ({data.windSpeed})</label><input type="range" min="0" max="100" value={data.windSpeed} onChange={(e) => handleChange('windSpeed', e.target.value)} className="accent-teal-500" /></div>
            <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Direction ({data.windDir}°)</label><input type="range" min="0" max="360" value={data.windDir} onChange={(e) => handleChange('windDir', e.target.value)} className="accent-teal-500" /></div>
        </div>
        <div className="space-y-4">
            <h3 className="font-bold text-sky-400 border-b border-slate-600 pb-1">Weather</h3>
            <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Clouds ({data.clouds}%)</label><input type="range" min="0" max="100" value={data.clouds} onChange={(e) => handleChange('clouds', e.target.value)} className="accent-gray-400" /></div>
            <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Rain ({data.rain}%)</label><input type="range" min="0" max="100" value={data.rain} onChange={(e) => handleChange('rain', e.target.value)} className="accent-blue-300" /></div>
        </div>
        <div className="space-y-4">
            <h3 className="font-bold text-sky-400 border-b border-slate-600 pb-1">Celestial</h3>
            <div className="flex flex-col">
                <label className="text-xs text-slate-400 mb-1">Moon Phase</label><input type="range" min="0" max="1" step="0.01" value={data.moonPhase} onChange={(e) => handleChange('moonPhase', e.target.value)} className="accent-yellow-200" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>New</span><span>Full</span><span>New</span></div>
            </div>
        </div>
      </div>
    </div>
  );
}