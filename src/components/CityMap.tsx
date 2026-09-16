import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  Filter, 
  Crosshair,
  AlertCircle,
  Bus as BusIcon,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { RoadIssue, BusFleet, MapViewMode, IssueType, Severity } from '../types';

interface CityMapProps {
  issues: RoadIssue[];
  busFleet: BusFleet[];
  selectedIssue: RoadIssue | null;
  onSelectIssue: (issue: RoadIssue) => void;
  onSelectBus: (bus: BusFleet) => void;
  filterType: IssueType | 'ALL';
  setFilterType: (type: IssueType | 'ALL') => void;
  filterSeverity: Severity | 'ALL';
  setFilterSeverity: (sev: Severity | 'ALL') => void;
}

export const CityMap: React.FC<CityMapProps> = ({
  issues,
  busFleet,
  selectedIssue,
  onSelectIssue,
  onSelectBus,
  filterType,
  setFilterType,
  filterSeverity,
  setFilterSeverity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const busesGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapMode, setMapMode] = useState<MapViewMode>('DEFAULT');
  const [showBuses, setShowBuses] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Default Center: Bharuch, Gujarat
  const DEFAULT_CENTER: [number, number] = [21.7085, 72.9960];
  const DEFAULT_ZOOM = 13;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Matter tile layer for ops center look
    const darkTileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
      }
    );
    darkTileLayer.addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Groups
    routesGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    busesGroupRef.current = L.layerGroup().addTo(map);
    heatmapGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer based on Map Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing base tiles
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let newTileLayer: L.TileLayer;
    if (mapMode === 'SATELLITE') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      );
    } else {
      // CartoDB Dark Matter
      newTileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      );
    }
    newTileLayer.addTo(map);
    newTileLayer.bringToBack();
  }, [mapMode]);

  // Update Bus Routes Polylines
  useEffect(() => {
    const routesGroup = routesGroupRef.current;
    if (!routesGroup) return;

    routesGroup.clearLayers();
    if (!showRoutes) return;

    // Distinct colors for each bus transit corridor
    const routeColors: Record<string, string> = {
      'BUS-07': '#06b6d4', // Cyan
      'BUS-12': '#3b82f6', // Electric blue
      'BUS-03': '#8b5cf6', // Violet
      'BUS-19': '#10b981', // Emerald
      'BUS-05': '#f59e0b', // Amber / Gold for generated inspection route
    };

    busFleet.forEach((bus) => {
      const isGenerated = bus.isGeneratedRoute || bus.id === 'BUS-05';
      const color = isGenerated ? '#f59e0b' : (routeColors[bus.id] || '#06b6d4');
      const polyline = L.polyline(bus.routeCoordinates, {
        color: color,
        weight: isGenerated ? 4.5 : 3,
        opacity: isGenerated ? 0.9 : 0.55,
        dashArray: isGenerated ? '8, 6' : '6, 8',
      });

      polyline.bindTooltip(
        `<div class="font-mono text-xs ${isGenerated ? 'text-amber-300 font-bold' : 'text-cyan-300 font-semibold'}">
          ${isGenerated ? '🧭 [SURVEY ROUTE] ' : ''}${bus.routeName}
        </div>`,
        { permanent: false, direction: 'center', className: 'bg-slate-900 text-slate-100 border-none' }
      );

      polyline.addTo(routesGroup);
    });
  }, [busFleet, showRoutes]);

  // Update Issue Markers & Heatmap Layer
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    const heatmapGroup = heatmapGroupRef.current;
    if (!markersGroup || !heatmapGroup) return;

    markersGroup.clearLayers();
    heatmapGroup.clearLayers();

    // Filter issues
    const filteredIssues = issues.filter((issue) => {
      if (filterType !== 'ALL' && issue.type !== filterType) return false;
      if (filterSeverity !== 'ALL' && issue.severity !== filterSeverity) return false;
      return true;
    });

    // If heatmap mode enabled, render glow circles representing road IRI hazard density
    if (mapMode === 'HEATMAP') {
      filteredIssues.forEach((issue) => {
        const radius = issue.severity === 'HIGH' ? 380 : issue.severity === 'MEDIUM' ? 240 : 160;
        const color = issue.severity === 'HIGH' ? '#ef4444' : issue.severity === 'MEDIUM' ? '#f59e0b' : '#10b981';
        
        const circle = L.circle([issue.lat, issue.lng], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.28,
          weight: 1.5,
          dashArray: '4, 4',
        });
        circle.addTo(heatmapGroup);
      });
    }

    filteredIssues.forEach((issue) => {
      const isSelected = selectedIssue?.id === issue.id;
      const isResolved = issue.status === 'RESOLVED';

      // Pick icon & colors
      let strokeColor = '#ef4444'; // Red for HIGH
      let glowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.7)] ring-rose-500';
      let iconEmoji = '🕳️';

      if (isResolved) {
        strokeColor = '#10b981';
        glowClass = 'shadow-[0_0_10px_rgba(16,185,129,0.5)] ring-emerald-500';
        iconEmoji = '✅';
      } else if (issue.severity === 'MEDIUM') {
        strokeColor = '#f59e0b';
        glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.7)] ring-amber-500';
      } else if (issue.severity === 'LOW') {
        strokeColor = '#10b981';
        glowClass = 'shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-emerald-500';
      }

      if (issue.type === 'waterlogging') iconEmoji = '🌊';
      else if (issue.type === 'road_damage') iconEmoji = '⚡';
      else if (issue.type === 'accident') iconEmoji = '🚨';
      else if (issue.type === 'construction') iconEmoji = '🚧';
      else if (issue.type === 'road_closed') iconEmoji = '⛔';

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-125 ${isSelected ? 'scale-135' : ''}">
          <!-- Pulsing ring for critical active hazards -->
          ${
            issue.severity === 'HIGH' && !isResolved
              ? `<div class="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping"></div>`
              : ''
          }
          <!-- Marker Core -->
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 bg-slate-950 ${glowClass}" style="border-color: ${strokeColor};">
            <span>${iconEmoji}</span>
          </div>
          <!-- ID Tag on Hover/Select -->
          ${
            isSelected
              ? `<div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/60 shadow-lg">
                  ${issue.id}
                </div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-road-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([issue.lat, issue.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectIssue(issue);
      });

      // Custom Dark Popup
      const popupHtml = `
        <div class="p-3 bg-[#0c121e] border border-cyan-900/60 rounded-lg text-slate-100 font-sans min-w-[240px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span class="font-mono text-xs font-bold text-cyan-400">${issue.id}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              isResolved
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : issue.severity === 'HIGH'
                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                : 'bg-amber-950 text-amber-300 border border-amber-700'
            }">
              ${isResolved ? 'RESOLVED' : `${issue.severity} SEVERITY`}
            </span>
          </div>
          <p class="font-semibold text-xs text-slate-100 mb-1 leading-snug">${issue.title}</p>
          <p class="text-[11px] text-slate-400 mb-1 leading-tight">📍 ${issue.locationName}</p>
          <div class="text-[10px] font-mono text-cyan-300 mb-1.5">⏱️ Timeline: ${issue.videoTimestamp || '00:14 in footage'}</div>
          ${
            issue.generatedBusRoute
              ? `<div class="text-[10px] font-mono text-amber-300 bg-amber-950/50 border border-amber-600/60 rounded px-1.5 py-0.5 mb-2 flex items-center justify-between">
                   <span>🧭 Survey Route: ${issue.generatedBusRoute.routeName}</span>
                   <span>${issue.generatedBusRoute.totalDistanceKm}km</span>
                 </div>`
              : ''
          }
          <div class="grid grid-cols-2 gap-1 text-[10px] font-mono bg-slate-900/90 p-1.5 rounded border border-slate-800 mb-2">
            <div><span class="text-slate-500">AI Conf:</span> <span class="text-cyan-300 font-bold">${issue.confidence}%</span></div>
            <div><span class="text-slate-500">Bus:</span> <span class="text-amber-300 font-bold">${issue.busId}</span></div>
            <div><span class="text-slate-500">Status:</span> <span class="text-slate-200">${issue.status}</span></div>
            <div><span class="text-slate-500">IRI Bump:</span> <span class="text-rose-400 font-bold">${issue.telemetry.zVibrationG}G</span></div>
          </div>
          <div class="flex items-center gap-1.5">
            <button 
              id="btn-inspect-popup-${issue.id}" 
              class="flex-1 py-1.5 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-md"
            >
              <span>Inspect Evidence</span>
            </button>
            <a 
              href="${issue.googleMapsUrl || `https://www.google.com/maps?q=${issue.lat},${issue.lng}`}" 
              target="_blank" 
              rel="noreferrer"
              class="py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors shrink-0"
              title="Open Google Maps Location"
            >
              <span>Map ↗</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-popup-${issue.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectIssue(issue);
            marker.closePopup();
          });
        }
      });

      marker.addTo(markersGroup);
    });
  }, [issues, selectedIssue, filterType, filterSeverity, mapMode, onSelectIssue]);

  // Update Moving Bus Fleet Markers
  useEffect(() => {
    const busesGroup = busesGroupRef.current;
    if (!busesGroup) return;

    busesGroup.clearLayers();
    if (!showBuses) return;

    busFleet.forEach((bus) => {
      const busHtml = `
        <div class="relative cursor-pointer group">
          <!-- Radar Scanning Sweep -->
          <div class="absolute -inset-2.5 rounded-full border border-cyan-400/40 radar-ping pointer-events-none"></div>
          
          <!-- Bus Node -->
          <div class="w-9 h-9 rounded-lg bg-[#0b1329] border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.8)] transition-transform hover:scale-125">
            <span class="text-base">🚌</span>
          </div>

          <!-- Bus ID & Speed Tag -->
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/90 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/50 shadow-md">
            ${bus.id} • ${bus.speedKmh}km/h
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: busHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([bus.lat, bus.lng], { icon: busIcon });

      marker.on('click', () => {
        onSelectBus(bus);
      });

      marker.bindTooltip(
        `<div class="font-mono text-xs">
          <div class="text-cyan-300 font-bold">${bus.id} (${bus.busNumber})</div>
          <div class="text-slate-300">${bus.routeName}</div>
          <div class="text-slate-400 text-[10px] mt-1">Driver: ${bus.driverName} | AI: ${bus.aiInferenceFps} FPS</div>
          <div class="text-cyan-400 text-[10px]">● Click to view Dashcam Footage Playback</div>
        </div>`,
        { direction: 'top', className: 'bg-slate-900 border border-slate-700 text-slate-100 p-2' }
      );

      marker.addTo(busesGroup);
    });
  }, [busFleet, showBuses, onSelectBus]);

  // Center on Selected Issue
  useEffect(() => {
    if (!selectedIssue || !mapInstanceRef.current) return;
    mapInstanceRef.current.panTo([selectedIssue.lat, selectedIssue.lng], {
      animate: true,
      duration: 0.8,
    });
  }, [selectedIssue]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM, {
      animate: true,
      duration: 0.8,
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#080b11] overflow-hidden">
      
      {/* Map Control Bar (Floating Top-Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5 bg-[#090e1a]/90 backdrop-blur-md p-1.5 rounded-lg border border-cyan-900/60 shadow-2xl">
        
        {/* Map Layers Mode Toggle */}
        <div className="flex items-center gap-1 border-r border-slate-800 pr-1.5">
          <button
            id="btn-map-mode-default"
            onClick={() => setMapMode('DEFAULT')}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              mapMode === 'DEFAULT'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark Ops
          </button>
          <button
            id="btn-map-mode-heatmap"
            onClick={() => setMapMode('HEATMAP')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              mapMode === 'HEATMAP'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Hazard IRI Heatmap</span>
          </button>
          <button
            id="btn-map-mode-satellite"
            onClick={() => setMapMode('SATELLITE')}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              mapMode === 'SATELLITE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Bus Fleet & Routes Visibility Toggles */}
        <button
          id="btn-toggle-buses"
          onClick={() => setShowBuses(!showBuses)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
            showBuses
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle live public buses"
        >
          <BusIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Buses ({busFleet.length})</span>
        </button>

        <button
          id="btn-toggle-routes"
          onClick={() => setShowRoutes(!showRoutes)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
            showRoutes
              ? 'bg-slate-800 text-slate-200 border border-slate-700'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle bus transit route polylines"
        >
          {showRoutes ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Routes</span>
        </button>

        {/* Recenter Button */}
        <button
          id="btn-recenter-city"
          onClick={handleRecenter}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Recenter to Bharuch Transit Grid"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* Floating Filter Badges (Top-Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {/* Severity Filter Dropdown */}
        <div className="bg-[#090e1a]/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-800 shadow-xl flex items-center gap-1.5 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 text-[11px]">Severity:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                filterSeverity === sev
                  ? sev === 'HIGH'
                    ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : sev === 'MEDIUM'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : sev === 'LOW'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* The Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full dark-map-tiles z-0" />

      {/* Floating Bottom Legend & Fleet Status */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#090e1a]/95 backdrop-blur-md p-2.5 rounded-lg border border-cyan-950 shadow-2xl max-w-sm hidden md:block">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-mono text-[11px] font-bold text-slate-200">BHARUCH FLEET TELEMETRY</span>
            </div>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
            >
              [Hide]
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <span>High Hazard (Pothole/Accident)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              <span>Medium (Waterlogging/Cracks)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span>Resolved / Repaired</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
              <span className="text-cyan-300">Active Bus (Dashcam Live)</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Edge AI: YOLOv8-RoadDamage</span>
            <span className="text-emerald-400">FPS: 28.4 | GPS: RTK-Sync</span>
          </div>
        </div>
      )}

      {/* Re-open legend button if hidden */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-3 left-3 z-[1000] bg-[#090e1a]/90 px-2 py-1 rounded text-xs font-mono text-cyan-300 border border-cyan-900"
        >
          [Show Legend]
        </button>
      )}

    </div>
  );
};
