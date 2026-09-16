import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  Cpu, 
  Bus, 
  Sparkles, 
  Activity, 
  Compass, 
  Maximize2, 
  Gauge, 
  Wifi,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { BusFleet } from '../types';

interface BusCameraHUDModalProps {
  bus: BusFleet | null;
  busFleet: BusFleet[];
  onClose: () => void;
  onSelectBus: (bus: BusFleet) => void;
  onTriggerDetectionFromBus: (bus: BusFleet) => void;
  onOpenUploadModal?: () => void;
}

export const BusCameraHUDModal: React.FC<BusCameraHUDModalProps> = ({
  bus,
  busFleet,
  onClose,
  onSelectBus,
  onTriggerDetectionFromBus,
  onOpenUploadModal,
}) => {
  if (!bus) return null;

  const [simulatedSpeed, setSimulatedSpeed] = useState(bus.speedKmh);
  const [activeAnomalyFlash, setActiveAnomalyFlash] = useState(false);
  const [flashDetails, setFlashDetails] = useState<{ label: string; confidence: number } | null>(null);
  const [videoTimestampSec, setVideoTimestampSec] = useState(14);

  // Periodic simulated timeline progression
  useEffect(() => {
    const interval = setInterval(() => {
      setVideoTimestampSec((prev) => (prev >= 48 ? 2 : prev + 1));
      setSimulatedSpeed((prev) => {
        const delta = (Math.random() - 0.5) * 3;
        return Math.max(20, Math.min(60, Math.round((prev + delta) * 10) / 10));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleTestDetection = () => {
    setActiveAnomalyFlash(true);
    const defectTypes = [
      { label: 'pothole_cavity', confidence: 95.2 },
      { label: 'waterlogging_puddle', confidence: 91.8 },
      { label: 'asphalt_crack_major', confidence: 89.4 },
    ];
    const picked = defectTypes[Math.floor(Math.random() * defectTypes.length)];
    setFlashDetails(picked);

    onTriggerDetectionFromBus(bus);

    setTimeout(() => {
      setActiveAnomalyFlash(false);
      setFlashDetails(null);
    }, 3500);
  };

  const formattedTimestamp = `00:${videoTimestampSec < 10 ? '0' : ''}${videoTimestampSec}`;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#080c16] border border-cyan-900/80 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header: Bus Selector + Pre-recorded Playback Status */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0c1322] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold">
              REC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {bus.id} ({bus.busNumber})
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-300">
                  {bus.routeName}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  <span>PRE-RECORDED FOOTAGE PLAYBACK</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Corridor Recording: <span className="text-slate-200">route_survey_1080p.mp4</span> | Hardware: <span className="text-cyan-400">{bus.edgeHardware}</span>
              </p>
            </div>
          </div>

          {/* Bus Switcher Dropdown & Upload Action */}
          <div className="flex items-center gap-2">
            {onOpenUploadModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUploadModal();
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 transition-colors cursor-pointer"
              >
                <span>📤 Upload Footage</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 px-1">Switch:</span>
              {busFleet.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelectBus(b)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    b.id === bus.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b.id}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Sub-Banner: MVP Detection Model */}
        <div className="px-4 py-1.5 bg-[#060a12] border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Processes uploaded road footage • Real-time camera streaming is a future system phase</span>
          </div>
          <span className="text-amber-300">
            Mapped Video Timeline: <strong>{formattedTimestamp} / 00:48</strong>
          </span>
        </div>

        {/* Dashcam Viewport Container */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center border-b border-slate-800">
          
          {/* Animated Road Simulation Visual */}
          <div className="absolute inset-0 bg-[#141924] flex items-center justify-center overflow-hidden">
            {/* Road Perspective Lines */}
            <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0a0e17" />
                  <stop offset="100%" stopColor="#1e2535" />
                </linearGradient>
              </defs>
              <polygon points="350,220 650,220 1000,600 0,600" fill="url(#roadGrad)" />
              {/* Center dividing lines */}
              <line x1="500" y1="220" x2="500" y2="600" stroke="#facc15" strokeWidth="8" strokeDasharray="30, 20" opacity="0.8" />
              {/* Lane boundaries */}
              <line x1="430" y1="220" x2="250" y2="600" stroke="#ffffff" strokeWidth="3" opacity="0.4" />
              <line x1="570" y1="220" x2="750" y2="600" stroke="#ffffff" strokeWidth="3" opacity="0.4" />
            </svg>

            {/* Simulated Detected Hazard on Road when Triggered */}
            {activeAnomalyFlash && flashDetails && (
              <div className="absolute top-[52%] left-[42%] w-48 h-32 border-2 border-rose-500 bg-rose-500/20 rounded shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse flex flex-col justify-between p-1 font-mono">
                <span className="px-1.5 py-0.5 bg-rose-600 text-white font-bold text-[11px] rounded shadow uppercase self-start">
                  {flashDetails.label}: {flashDetails.confidence}%
                </span>
                <span className="text-[10px] text-rose-300 font-bold self-end bg-black/70 px-1 rounded">
                  Timeline Sync: {formattedTimestamp} • GPS: {bus.lat.toFixed(4)}°N
                </span>
              </div>
            )}
          </div>

          {/* HUD OVERLAY: Top Flight-Deck Style Telemetry */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                ● DASHCAM LOG PLAYBACK
              </span>
              <span className="text-slate-300">
                FOV: 120° Wide Angle
              </span>
            </div>

            <div className="flex items-center gap-3 text-cyan-300">
              <span>INFERENCE: <strong className="text-emerald-400">{bus.aiInferenceFps} FPS</strong></span>
              <span>•</span>
              <span>YOLOv8-ROADDAMAGE</span>
            </div>
          </div>

          {/* HUD Crosshair Reticle Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-24 h-24 border border-cyan-400/60 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            </div>
            <div className="absolute w-36 h-[1px] bg-cyan-400/40"></div>
            <div className="absolute h-36 w-[1px] bg-cyan-400/40"></div>
          </div>

          {/* HUD OVERLAY: Bottom Telemetry Readouts */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">VIDEO TIMELINE:</span>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  {formattedTimestamp} <span className="text-xs font-normal text-slate-400">/ 00:48</span>
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-500 block text-[10px]">IMU Z-AXIS:</span>
                <span className="text-sm font-bold text-cyan-300">
                  {activeAnomalyFlash ? '2.74 G (SPIKE)' : '1.02 G (NORMAL)'}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3 hidden sm:block">
                <span className="text-slate-500 block text-[10px]">CORRESPONDING GPS:</span>
                <span className="text-xs text-slate-300 font-mono">
                  {bus.lat.toFixed(4)}° N, {bus.lng.toFixed(4)}° E
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">TAGGED DEFECTS:</span>
              <span className="text-emerald-400 font-bold text-sm">{bus.detectionsCount} Hazards</span>
            </div>
          </div>

          {/* Scanline Visual Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent h-16 w-full animate-scanline pointer-events-none" />
        </div>

        {/* Footer Actions: Trigger Ingestion packet */}
        <div className="p-3 bg-[#0c1322] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>AI model evaluates uploaded media frames and links timeline marks to road coordinates.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-test-detection"
              onClick={handleTestDetection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flag Hazard at {formattedTimestamp}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              Close Viewer
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
