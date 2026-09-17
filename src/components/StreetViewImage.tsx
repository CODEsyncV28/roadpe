import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Compass, AlertCircle, Loader2 } from 'lucide-react';

interface StreetViewImageProps {
  lat?: number;
  lng?: number;
  locationName?: string;
  googleMapsUrl?: string;
  className?: string;
  aspectRatio?: string;
  showCoordinatesBadge?: boolean;
}

type ViewState =
  | 'LOADING'
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'MISSING_COORDINATES'
  | 'INVALID_COORDINATES'
  | 'ERROR';

export const StreetViewImage: React.FC<StreetViewImageProps> = ({
  lat,
  lng,
  locationName,
  googleMapsUrl,
  className = '',
  aspectRatio = 'aspect-[16/9]',
  showCoordinatesBadge = false,
}) => {
  const [state, setState] = useState<ViewState>('LOADING');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ date?: string; copyright?: string } | null>(null);

  const fallbackMapsUrl =
    googleMapsUrl ||
    (lat !== undefined && lng !== undefined
      ? `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
      : 'https://www.google.com/maps');

  useEffect(() => {
    // 1. Validate coordinates presence
    if (lat === undefined || lng === undefined || (lat === 0 && lng === 0)) {
      setState('MISSING_COORDINATES');
      return;
    }

    // 2. Validate coordinates range
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setState('INVALID_COORDINATES');
      return;
    }

    let isMounted = true;
    setState('LOADING');

    // 3. Query backend Street View metadata
    fetch(`/api/streetview/metadata?lat=${lat}&lng=${lng}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        if (data.status === 'AVAILABLE' && data.imageUrl) {
          setImageUrl(data.imageUrl);
          setMetadata({ date: data.date, copyright: data.copyright });
          setState('AVAILABLE');
        } else if (data.status === 'ZERO_RESULTS' || data.status === 'UNAVAILABLE' || data.status === 'NO_API_KEY') {
          setState('UNAVAILABLE');
        } else if (data.status === 'NO_COORDINATES') {
          setState('MISSING_COORDINATES');
        } else if (data.status === 'INVALID_COORDINATES') {
          setState('INVALID_COORDINATES');
        } else {
          setState('ERROR');
        }
      })
      .catch((err) => {
        console.warn('[StreetView Fetch Note]:', err);
        if (isMounted) setState('ERROR');
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden border border-slate-800 bg-[#070b14] flex flex-col items-center justify-center select-none font-mono ${aspectRatio} ${className}`}
    >
      {/* Top Banner: Location Street View Label */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-cyan-800/80 text-[10px] font-bold text-cyan-300">
        <Compass className="w-3 h-3 text-cyan-400" />
        <span>LOCATION STREET VIEW</span>
      </div>

      {/* Top Right: Open in Google Maps Link */}
      <a
        href={fallbackMapsUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-[10px] text-slate-300 hover:text-cyan-200 transition-colors"
        title="Open coordinates in Google Maps"
      >
        <span>Open Maps</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </a>

      {/* STATE A: Street View Available Image */}
      {state === 'AVAILABLE' && imageUrl && (
        <>
          <img
            src={imageUrl}
            alt={locationName || 'Road Street View'}
            className="w-full h-full object-cover"
            onError={() => setState('ERROR')}
          />
          {/* Bottom Attribution */}
          <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/75 text-[9px] text-slate-400">
            {metadata?.date ? `Street View &bull; ${metadata.date}` : 'Google Street View'}
          </div>
        </>
      )}

      {/* STATE B: Loading State */}
      {state === 'LOADING' && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <div className="text-[11px] text-cyan-300 font-semibold">
            [Loading street view...]
          </div>
          <div className="text-[10px] text-slate-500">
            Querying Google Street View for {lat?.toFixed(4)}, {lng?.toFixed(4)}
          </div>
        </div>
      )}

      {/* STATE C: Unavailable Fallback */}
      {state === 'UNAVAILABLE' && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Compass className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            Street View unavailable for this location.
          </div>
          <a
            href={fallbackMapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-800/80 hover:border-cyan-500 text-[10px] text-cyan-300 font-bold transition-all cursor-pointer shadow-sm mt-1"
          >
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>Open Location in Google Maps</span>
          </a>
        </div>
      )}

      {/* STATE D: Missing Coordinates */}
      {state === 'MISSING_COORDINATES' && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5 max-w-[85%]">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <div className="text-[11px] text-amber-300 font-semibold">
            Location coordinates unavailable
          </div>
          <div className="text-[10px] text-slate-500">
            Problem record does not contain valid latitude/longitude coordinates.
          </div>
        </div>
      )}

      {/* STATE E: Invalid Coordinates */}
      {state === 'INVALID_COORDINATES' && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5 max-w-[85%]">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div className="text-[11px] text-rose-300 font-semibold">
            Invalid problem location
          </div>
          <div className="text-[10px] text-slate-500">
            Stored coordinates out of valid geospatial range.
          </div>
        </div>
      )}

      {/* STATE F: API Error */}
      {state === 'ERROR' && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 max-w-[85%]">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="text-[11px] text-slate-300 font-medium">
            Street View could not be loaded.
          </div>
          <a
            href={fallbackMapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 transition-colors"
          >
            <span>Open Location in Google Maps</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}

      {/* Optional Coordinates Badge in bottom-left */}
      {showCoordinatesBadge && lat !== undefined && lng !== undefined && (
        <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-slate-800 text-[9px] text-cyan-400">
          📍 {lat.toFixed(5)}°, {lng.toFixed(5)}°
        </div>
      )}
    </div>
  );
};
