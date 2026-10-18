import React, { useState } from 'react';
import { Compass, Navigation, Maximize2, Layers, MapPin } from 'lucide-react';
import { DAR_ES_SALAAM_HUBS } from '../services/trackingService';

interface InteractiveMapProps {
  currentLat: number;
  currentLng: number;
  heading: number;
  speedKmh: number;
  vehicleType: string;
  driverName: string;
  driverPlate: string;
  pickupName: string;
  dropoffName: string;
  status: string;
  isTrackingActive: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentLat,
  currentLng,
  heading,
  speedKmh,
  vehicleType,
  driverName,
  driverPlate,
  pickupName,
  dropoffName,
  status,
  isTrackingActive,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  // SVG coordinate projection helper around Dar es Salaam metro bounding box
  const minLat = -6.89;
  const maxLat = -6.74;
  const minLng = 39.19;
  const maxLng = 39.31;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 440 + 30;
    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(480, y)) };
  };

  const driverPos = projectCoords(currentLat, currentLng);
  const pickupPos = projectCoords(-6.8202, 39.2783); // Kariakoo
  const dropoffPos = projectCoords(-6.7712, 39.2312); // Mwenge

  const getVehicleEmoji = (type: string) => {
    switch (type) {
      case 'motorcycle':
        return '🛵';
      case 'bajaji':
        return '🛺';
      case 'car_van':
        return '🚐';
      case 'truck':
        return '🚛';
      default:
        return '📦';
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#14213D] border border-slate-800 overflow-hidden shadow-xl font-sans select-none">
      {/* Top Map Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-[#14213D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-200 pointer-events-auto flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#2563EB] animate-spin" style={{ animationDuration: '6s' }} />
          <span>Dar es Salaam Metro Route</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-[#16A34A] font-bold tabular-nums">{speedKmh} km/h</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
            className="w-8 h-8 rounded-lg bg-[#14213D] hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center text-sm font-bold shadow-md transition-colors"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="w-8 h-8 rounded-lg bg-[#14213D] hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center text-sm font-bold shadow-md transition-colors"
            title="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-2.5 h-8 rounded-lg bg-[#14213D] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium shadow-md transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full h-[360px] md:h-[420px] overflow-hidden flex items-center justify-center bg-[#0c1527]">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
            </pattern>
            {/* Indian Ocean Gradient */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.95" />
            </linearGradient>
            {/* Active Route Gradient using Electric Blue and Vibrant Orange */}
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16A34A" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#FF7A00" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="500" fill="#0c1527" />
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Coastline */}
          <path
            d="M 680,0 C 660,100 620,180 640,260 C 660,320 720,380 700,500 L 800,500 L 800,0 Z"
            fill="url(#oceanGrad)"
          />
          <text x="725" y="240" fill="#38bdf8" opacity="0.4" fontSize="11" fontWeight="700" letterSpacing="2">
            INDIAN OCEAN
          </text>

          {/* Major Trunk Roads (Morogoro Rd, Bagamoyo Rd, Nyerere Rd) */}
          <path
            d="M 520,380 Q 480,260 410,180 T 360,90"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 520,380 Q 480,260 410,180 T 360,90"
            fill="none"
            stroke="#334155"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M 560,360 L 520,380 L 440,340 L 320,290 L 160,250 L 20,220"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 560,360 L 520,380 L 440,340 L 320,290 L 160,250 L 20,220"
            fill="none"
            stroke="#475569"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Active Mission Route Line */}
          <path
            d="M 520,380 Q 460,260 410,180"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="6"
            strokeDasharray="7,4"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Hub Markers */}
          {DAR_ES_SALAAM_HUBS.map((hub) => {
            const p = projectCoords(hub.lat, hub.lng);
            const isSelected = selectedHub === hub.name;
            return (
              <g
                key={hub.name}
                className="cursor-pointer group"
                onClick={() => setSelectedHub(isSelected ? null : hub.name)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6 : 3.5}
                  fill={isSelected ? '#FF7A00' : '#64748b'}
                  stroke="#14213D"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                <text
                  x={p.x + 8}
                  y={p.y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="system-ui"
                  className="pointer-events-none group-hover:fill-white font-medium"
                >
                  {hub.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Pickup Marker (Kariakoo) in Fresh Green #16A34A */}
          <g transform={`translate(${pickupPos.x}, ${pickupPos.y})`}>
            <circle r="14" fill="#16A34A" fillOpacity="0.25" className="animate-ping" />
            <circle r="7" fill="#16A34A" stroke="#ffffff" strokeWidth="2" />
            <text y="-11" textAnchor="middle" fill="#16A34A" fontSize="10" fontWeight="bold">
              PICKUP
            </text>
          </g>

          {/* Dropoff Marker (Mwenge) in Red #DC2626 */}
          <g transform={`translate(${dropoffPos.x}, ${dropoffPos.y})`}>
            <circle r="14" fill="#DC2626" fillOpacity="0.25" className="animate-ping" />
            <circle r="7" fill="#DC2626" stroke="#ffffff" strokeWidth="2" />
            <text y="-11" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="bold">
              DESTINATION
            </text>
          </g>

          {/* Live Driver Marker in Electric Blue #2563EB & Vibrant Orange */}
          {isTrackingActive && (
            <g
              transform={`translate(${driverPos.x}, ${driverPos.y}) rotate(${heading})`}
              className="transition-all duration-700 ease-out"
            >
              <circle r="22" fill="#2563EB" fillOpacity="0.3" className="animate-ping" />
              <circle r="15" fill="#2563EB" stroke="#ffffff" strokeWidth="2.5" />
              <polygon points="0,-19 5,-13 -5,-13" fill="#FF7A00" />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fontSize="13"
                className="select-none pointer-events-none"
              >
                {getVehicleEmoji(vehicleType)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Telemetry Card in Deep Navy */}
      <div className="p-3.5 bg-[#14213D] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#2563EB] flex items-center justify-center text-lg">
            {getVehicleEmoji(vehicleType)}
          </div>
          <div>
            <div className="font-extrabold text-white">{driverName}</div>
            <div className="text-slate-400 font-mono text-[11px]">
              {driverPlate} · {vehicleType.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">Corridor</span>
            <span className="font-semibold text-slate-200">Kariakoo → Mwenge</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">GPS Coordinates</span>
            <span className="font-mono text-[11px] text-slate-300 tabular-nums">
              {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">ETA</span>
            <span className="font-extrabold text-[#16A34A]">12 Mins</span>
          </div>
        </div>
      </div>
    </div>
  );
};
