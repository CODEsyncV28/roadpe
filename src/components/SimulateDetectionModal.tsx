import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Camera, 
  MapPin, 
  Bus, 
  AlertTriangle, 
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { RoadIssue, IssueType, Severity, BusFleet } from '../types';
import { generateEvidenceDataUrl } from '../data/mockRoadData';

interface SimulateDetectionModalProps {
  busFleet: BusFleet[];
  onClose: () => void;
  onIngestDetection: (newIssue: RoadIssue) => void;
}

export const SimulateDetectionModal: React.FC<SimulateDetectionModalProps> = ({
  busFleet,
  onClose,
  onIngestDetection,
}) => {
  const [selectedType, setSelectedType] = useState<IssueType>('pothole');
  const [selectedBusId, setSelectedBusId] = useState<string>(busFleet[0]?.id || 'BUS-07');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [confidence, setConfidence] = useState<number>(93.8);
  const [locationPreset, setLocationPreset] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState('');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [isUploadingCustomImage, setIsUploadingCustomImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Bharuch location presets
  const presets = [
    { name: 'Station Road Overbridge Junction', lat: 21.7095, lng: 72.9880, route: 'Route 4B' },
    { name: 'GIDC Industrial Bypass Km 4.2', lat: 21.7280, lng: 73.0060, route: 'Route 4B' },
    { name: 'Zadeshwar Narmada Bridge Approach', lat: 21.6895, lng: 73.0130, route: 'Route 9A' },
    { name: 'Kasak Circle North Avenue', lat: 21.7025, lng: 72.9930, route: 'Route 9A' },
    { name: 'NH-48 Corridor Near Bholav Turn', lat: 21.7210, lng: 73.0150, route: 'Route 11' },
    { name: 'Heritage Golden Bridge Approach Rd', lat: 21.6935, lng: 72.9795, route: 'Route 2C' },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCustomImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('uploadId', `sim_${Date.now()}`);

      const res = await fetch('/api/detect-hazard', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.result_image) {
        setCustomImageBase64(data.result_image);
        if (data.detections && data.detections.length > 0) {
          const firstDet = data.detections[0];
          setSelectedType(firstDet.class as IssueType);
          setConfidence(firstDet.confidence);
          if (firstDet.severity) setSeverity(firstDet.severity as Severity);
        }
      } else {
        throw new Error(data.error || 'Failed to process image');
      }
    } catch (err: any) {
      console.error('[Simulate Detection Upload Error]', err);
      setUploadError(err.message || 'Image processing failed');
    } finally {
      setIsUploadingCustomImage(false);
    }
  };

  const handleIngest = () => {
    const preset = presets[locationPreset];
    const timestampStr = new Date().toLocaleTimeString() + ' IST';
    const newId = `DET-${Math.floor(8930 + Math.random() * 900)}`;

    const titleMap: Record<IssueType, string> = {
      pothole: 'Severe Asphalt Pothole Cluster Detected',
      waterlogging: 'Critical Road Waterlogging & Ponding Submergence',
      road_damage: 'Extensive Transverse Cracks & Road Base Failure',
      accident: 'Emergency Road Incident & Obstruction Collision',
      construction: 'Unscheduled Road Construction Work',
      road_closed: 'Emergency Route Closure Enacted',
      traffic_anomaly: 'Sudden Traffic Congestion / Vehicle Stoppage',
    };

    const evidence = customImageBase64 || generateEvidenceDataUrl(
      selectedType,
      customTitle || titleMap[selectedType],
      selectedBusId,
      timestampStr
    );

    const newIssue: RoadIssue = {
      id: newId,
      type: selectedType,
      title: customTitle.trim() || titleMap[selectedType],
      locationName: `${preset.name}, Bharuch`,
      lat: preset.lat + (Math.random() - 0.5) * 0.003,
      lng: preset.lng + (Math.random() - 0.5) * 0.003,
      severity: severity,
      confidence: confidence,
      busId: selectedBusId,
      busRoute: preset.route,
      timestamp: `${new Date().toISOString().split('T')[0]} ${timestampStr}`,
      status: 'PENDING',
      verification: 'AI_DETECTED',
      evidenceImage: evidence,
      boundingBoxes: [
        {
          id: `box-${Date.now()}`,
          label: `${selectedType}_detected`,
          confidence: confidence,
          x: 32 + Math.floor(Math.random() * 15),
          y: 35 + Math.floor(Math.random() * 15),
          width: 36,
          height: 32,
          color: severity === 'HIGH' ? '#ef4444' : '#f59e0b',
        }
      ],
      telemetry: {
        speedKmh: Math.floor(30 + Math.random() * 25),
        zVibrationG: selectedType === 'pothole' ? 2.45 : 0.85,
        roadRoughnessIRI: 5.4,
        cameraFov: '120° Wide Angle Front Dashcam',
        weatherCondition: 'Dry / Clear Day',
      },
      estimatedDimensions: {
        depthCm: selectedType === 'pothole' ? 7.5 : undefined,
        lengthM: 2.4,
        widthM: 1.6,
        blockedLanes: severity === 'HIGH' ? 2 : 1,
      },
      roadCondition: severity === 'HIGH' ? 'Critical' : 'Poor',
      priorityScore: Math.floor(75 + Math.random() * 22),
    };

    onIngestDetection(newIssue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090e1a] border border-cyan-800 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.2)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0c1322] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wide">
                Simulate Bus AI Ingestion Packet
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Tests edge YOLOv8 model frame capture → GPS tagging → FastAPI ingestion pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs font-mono">
          
          {/* Defect Type Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block text-[11px]">
              1. Detected Road Hazard Situation:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { type: 'pothole', icon: '🕳️', label: 'Pothole' },
                { type: 'waterlogging', icon: '🌊', label: 'Waterlogging' },
                { type: 'road_damage', icon: '⚡', label: 'Cracks / Damage' },
                { type: 'accident', icon: '🚨', label: 'Accident' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type as IssueType)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedType === item.type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bus ID & Location Preset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block text-[11px]">
                2. Reporting Bus (Edge Camera):
              </label>
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {busFleet.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block text-[11px]">
                3. Bharuch Corridor Location:
              </label>
              <select
                value={locationPreset}
                onChange={(e) => setLocationPreset(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {presets.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Severity & Confidence Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block text-[11px]">
                4. Hazard Severity Tier:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['HIGH', 'MEDIUM', 'LOW'] as Severity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-1.5 rounded text-center font-bold border transition-colors cursor-pointer ${
                      severity === sev
                        ? sev === 'HIGH'
                          ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                          : sev === 'MEDIUM'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold">5. AI Confidence:</span>
                <span className="text-cyan-300 font-bold">{confidence}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                step="0.5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Optional Custom Title or Image Upload */}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[11px] block">
              Custom Title / Description (Optional):
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Severe Road Trench Near GIDC Gate 2..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* File Upload Option */}
          <div className="p-3 rounded-lg bg-slate-950 border border-dashed border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-300 block text-[11px]">Upload Custom Road Frame (Optional):</span>
                <span className="text-slate-500 text-[10px]">Auto-generates bounding boxes &amp; camera HUD</span>
              </div>
            </div>
            <label className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800 text-xs cursor-pointer transition-colors">
              Browse Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {isUploadingCustomImage && (
            <div className="p-2 rounded bg-cyan-950/50 border border-cyan-500/50 flex items-center gap-2 text-[11px] text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Passing exact uploaded image to YOLO model &amp; generating annotations...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-2 rounded bg-rose-950/60 border border-rose-500/60 flex items-center justify-between text-[11px] text-rose-300">
              <span>Error: {uploadError}</span>
              <button type="button" onClick={() => setUploadError(null)} className="font-bold underline">Dismiss</button>
            </div>
          )}

          {customImageBase64 && (
            <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between text-[11px]">
              <span className="text-cyan-300">✓ Custom YOLO-processed image verified &amp; connected</span>
              <button
                type="button"
                onClick={() => setCustomImageBase64(null)}
                className="text-rose-400 hover:text-rose-300 font-bold"
              >
                Clear
              </button>
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-3 bg-[#0c1322] border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-ingest-packet"
            onClick={handleIngest}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ingest Telemetry Packet &amp; Alert Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
};
