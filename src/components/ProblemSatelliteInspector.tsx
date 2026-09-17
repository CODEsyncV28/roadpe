import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Compass, 
  Plus, 
  Minus, 
  Crosshair, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface ProblemSatelliteInspectorProps {
  lat: number;
  lng: number;
  locationName?: string;
  issueTitle?: string;
  problemType?: string;
  severity?: string;
  className?: string;
}

// MapTiler API Key from Environment Variable
const MAPTILER_API_KEY = (import.meta.env.VITE_MAPTILER_API_KEY || '').trim();
const hasValidMapTilerKey = Boolean(
  MAPTILER_API_KEY &&
  !MAPTILER_API_KEY.includes('YOUR_MAPTILER') &&
  !MAPTILER_API_KEY.includes('undefined')
);

// High-resolution satellite raster style fallback for real aerial road environment
const SATELLITE_FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'satellite-aerial-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'satellite-aerial-layer',
      type: 'raster',
      source: 'satellite-aerial-imagery',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const ProblemSatelliteInspector: React.FC<ProblemSatelliteInspectorProps> = ({
  lat,
  lng,
  locationName,
  issueTitle,
  problemType = 'Road Hazard',
  severity,
  className = 'h-64 sm:h-72',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(18);
  const [retryNonce, setRetryNonce] = useState(0);

  // Validate that real coordinates exist (no default/fabricated coordinates)
  const hasValidCoordinates = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);

  useEffect(() => {
    if (!mapContainerRef.current || !hasValidCoordinates) return;

    // Reset states
    setIsLoaded(false);
    setLoadError(null);

    let map: maplibregl.Map;

    try {
      const styleConfig: string | maplibregl.StyleSpecification = hasValidMapTilerKey
        ? `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`
        : SATELLITE_FALLBACK_STYLE;

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleConfig,
        center: [lng, lat],
        zoom: 18,
        pitch: 20, // Gentle tactical tilt to reveal road geometry and pavement lines
        bearing: 0,
        attributionControl: false,
        interactive: true,
      });

      mapInstanceRef.current = map;

      // Handle map error gracefully without crashing
      map.on('error', (e) => {
        // If primary MapTiler style fails to load, attempt fallback to satellite raster
        if (hasValidMapTilerKey && !map.isStyleLoaded()) {
          console.warn('[Satellite Inspector] Primary MapTiler style failed, switching to aerial imagery fallback...');
          try {
            map.setStyle(SATELLITE_FALLBACK_STYLE);
            return;
          } catch {
            // Fall through to error
          }
        }
        console.warn('[Satellite Inspector Handled]', e?.error?.message || e?.error);
        if (!map.isStyleLoaded()) {
          setLoadError('Map imagery unavailable for this location.');
        }
      });

      map.on('load', () => {
        setIsLoaded(true);
        setCurrentZoom(Math.round(map.getZoom()));

        // Create Custom High-Contrast Target Reticle Element
        const markerEl = document.createElement('div');
        markerEl.className = 'relative flex items-center justify-center pointer-events-none';
        markerEl.innerHTML = `
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; border: 2px solid #06b6d4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6;"></div>
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; border: 1.5px dashed #f59e0b; animation: spin 8s linear infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 12px #ef4444; display: flex; align-items: center; justify-content: center;">
            <div style="width: 3px; height: 3px; border-radius: 9999px; background-color: #ffffff;"></div>
          </div>
        `;

        // Attach target reticle to exact problem coordinates
        const marker = new maplibregl.Marker({ element: markerEl })
          .setLngLat([lng, lat])
          .addTo(map);

        markerRef.current = marker;
      });

      map.on('zoom', () => {
        setCurrentZoom(Math.round(map.getZoom()));
      });

    } catch (err: any) {
      console.error('[Satellite Inspector Init Error]', err);
      setLoadError('Map imagery unavailable');
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, retryNonce, hasValidCoordinates]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut({ duration: 300 });
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && hasValidCoordinates) {
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 18,
        pitch: 20,
        bearing: 0,
        duration: 800,
      });
    }
  };

  // If no coordinates stored for this record
  if (!hasValidCoordinates) {
    return (
      <div className={`w-full rounded-lg border border-slate-800 bg-[#080d1a] flex flex-col items-center justify-center p-6 text-center text-slate-400 ${className}`}>
        <AlertTriangle className="w-8 h-8 text-amber-400 mb-2 opacity-80" />
        <div className="text-xs font-mono font-bold text-slate-200">Map imagery unavailable</div>
        <div className="text-[11px] font-mono text-slate-500 mt-1 max-w-xs">
          No geospatial coordinates stored for this record.
        </div>
      </div>
    );
  }

  // If map imagery failed to load
  if (loadError) {
    return (
      <div className={`relative w-full rounded-lg border border-slate-800 bg-[#060a14] flex flex-col items-center justify-center p-6 text-center overflow-hidden ${className}`}>
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-700 mx-auto text-cyan-400">
            <Compass className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-xs font-mono font-bold text-slate-200">
            Map imagery unavailable
          </div>
          <div className="text-[11px] font-mono text-slate-400 max-w-sm">
            Satellite tiles could not be rendered for coordinates:
            <div className="text-cyan-400 font-bold mt-0.5">
              {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRetryNonce((prev) => prev + 1)}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading Imagery</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-cyan-900/80 bg-black group shadow-xl ${className}`}>
      {/* MapLibre DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Status Badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
        <div className="px-2 py-1 rounded bg-black/85 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">AERIAL / SATELLITE ROAD VIEW</span>
        </div>
        {severity && (
          <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold border backdrop-blur-md uppercase ${
            severity === 'HIGH'
              ? 'bg-rose-950/80 text-rose-300 border-rose-700'
              : 'bg-amber-950/80 text-amber-300 border-amber-700'
          }`}>
            {severity}
          </div>
        )}
      </div>

      {/* Top Right Zoom Controls & Recenter */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter on problem coordinates"
          className="p-1.5 rounded bg-black/85 hover:bg-slate-900 backdrop-blur-md text-cyan-300 hover:text-cyan-200 border border-slate-700 transition-colors shadow cursor-pointer flex items-center justify-center"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom in"
          className="p-1.5 rounded bg-black/85 hover:bg-slate-900 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700 transition-colors shadow cursor-pointer flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom out"
          className="p-1.5 rounded bg-black/85 hover:bg-slate-900 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700 transition-colors shadow cursor-pointer flex items-center justify-center"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Reticle Legend Label (Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 z-10 pointer-events-none">
        <div className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-slate-800 text-[9px] font-mono text-slate-200 shadow whitespace-nowrap">
          🎯 {problemType.toUpperCase()} TARGET POINT
        </div>
      </div>

      {/* Bottom Left Coordinate Bar */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none flex items-center gap-1.5">
        <div className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 shadow">
          📍 <span className="text-cyan-400 font-semibold">{lat.toFixed(6)}° N, {lng.toFixed(6)}° E</span>
        </div>
        <div className="hidden sm:block px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-slate-800 text-[9px] font-mono text-slate-400">
          z{currentZoom}
        </div>
      </div>

      {/* Bottom Right Source Attribution */}
      <div className="absolute bottom-1 right-2 z-10 pointer-events-none text-[8px] font-mono text-slate-400/80 bg-black/60 px-1 rounded">
        {hasValidMapTilerKey ? 'MapTiler Satellite' : 'Aerial Imagery'}
      </div>
    </div>
  );
};
