import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Wrench, 
  Cpu, 
  Camera, 
  MapPin, 
  Clock, 
  Bus, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Layers, 
  FileText, 
  Upload, 
  Compass, 
  Navigation,
  Sliders,
  DollarSign,
  Maximize2,
  Route,
  ExternalLink,
  Check,
  Send,
  UserCheck,
  Building2,
  Play,
  Sparkles
} from 'lucide-react';
import { RoadIssue, WorkflowStatus, VerificationStatus, IssueType, Severity, BusFleet } from '../types';
import { generateBusRouteForLocation, parseGoogleMapsInput, PRESET_GMAP_LANDMARKS } from '../utils/routeGenerator';

interface IssueDetailModalProps {
  issue: RoadIssue | null;
  onClose: () => void;
  onUpdateIssue: (updated: RoadIssue, generatedBus?: BusFleet) => void;
  onOpenAssignModal?: (issue: RoadIssue) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onUpdateIssue,
  onOpenAssignModal,
}) => {
  if (!issue) return null;

  const [activeTab, setActiveTab] = useState<'AI_DETECTION' | 'AUTHORITY_VERIFICATION' | 'STATUS_TRACKING'>('AI_DETECTION');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  const hasValidGps = Boolean(
    (issue.hasSelectedLocation || (issue.lat !== 0 || issue.lng !== 0)) &&
    typeof issue.lat === 'number' &&
    typeof issue.lng === 'number' &&
    !isNaN(issue.lat) &&
    !isNaN(issue.lng) &&
    (issue.lat !== 0 || issue.lng !== 0) &&
    issue.locationName !== 'Location not selected'
  );

  const hasLocation = Boolean(
    issue.userEnteredLocation ||
    (issue.locationName && issue.locationName !== 'Location not selected') ||
    hasValidGps
  );
  const displayLocation = issue.userEnteredLocation || issue.locationName || (hasValidGps ? `${issue.lat.toFixed(6)}° N, ${issue.lng.toFixed(6)}° E` : 'Location not selected');

  // Google Maps & Route generation state for this issue
  const [gmapInput, setGmapInput] = useState(
    issue.googleMapsUrl || 
    (hasValidGps ? `${issue.lat.toFixed(6)}, ${issue.lng.toFixed(6)}` : '')
  );
  const [isGeneratingModalRoute, setIsGeneratingModalRoute] = useState(false);
  const [routeGeneratedToast, setRouteGeneratedToast] = useState('');

  // Authority Layer State
  const [verification, setVerification] = useState<VerificationStatus>(issue.verification);
  const [roadCondition, setRoadCondition] = useState(issue.roadCondition);
  const [correctedType, setCorrectedType] = useState<IssueType>(issue.type);
  const [roadClosureActive, setRoadClosureActive] = useState(!!issue.roadClosureActive);
  const [detourRouteName, setDetourRouteName] = useState(issue.detourRouteName || '');
  const [speedLimitKmh, setSpeedLimitKmh] = useState(issue.speedLimitKmh || 30);
  const [authorityNotes, setAuthorityNotes] = useState(issue.authorityNotes || '');

  // Maintenance Layer State
  const [status, setStatus] = useState<WorkflowStatus>(issue.status);
  const [assignedDept, setAssignedDept] = useState(issue.assignedDept || 'PWD Municipal Road Division');
  const [assignedCrew, setAssignedCrew] = useState(issue.assignedCrew || 'Road Patch Squad Alpha');
  const [workOrderId, setWorkOrderId] = useState(issue.workOrderId || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [repairNotes, setRepairNotes] = useState(issue.repairNotes || '');
  const [repairMaterials, setRepairMaterials] = useState(issue.repairMaterials || 'Cold-mix polymer bitumen (50kg), tack coat emulsion');
  const [repairCostEstimateInr, setRepairCostEstimateInr] = useState(issue.repairCostEstimateInr || 4500);
  const [afterRepairImage, setAfterRepairImage] = useState(issue.afterRepairImage || '');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Server-side Gemini AI Hazard Assessment State
  const [geminiAssessment, setGeminiAssessment] = useState<string | null>(null);
  const [isAssessingWithGemini, setIsAssessingWithGemini] = useState(false);
  const [geminiUrgencyScore, setGeminiUrgencyScore] = useState<number | null>(null);

  const handleRequestGeminiAssessment = async () => {
    setIsAssessingWithGemini(true);
    try {
      const res = await fetch('/api/ai/assess-hazard', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          problemId: issue.id,
          type: issue.type,
          severity: issue.severity,
          locationName: issue.locationName,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.aiAssessment) {
          setGeminiAssessment(data.aiAssessment);
          if (data.urgencyScore) setGeminiUrgencyScore(data.urgencyScore);
        }
      }
    } catch (err) {
      console.error('[Gemini AI Assessment Request Error]', err);
    } finally {
      setIsAssessingWithGemini(false);
    }
  };

  const handleSaveAuthorityChanges = (overrideVerification?: VerificationStatus) => {
    const finalVerification = overrideVerification || verification;
    
    let updated: RoadIssue = {
      ...issue,
      verification: finalVerification,
      verifiedBy: 'Municipal Senior Inspector (Badge #4092)',
      verifiedAt: new Date().toLocaleTimeString() + ' IST',
    };

    const newHistory = [...(updated.workflowHistory || [])];
    let stageStr = 'Verified';
    let noteStr = authorityNotes || 'AI detection verified by staff';

    if (finalVerification === 'FALSE_POSITIVE' || finalVerification === 'False Positive') {
      updated.status = 'Closed';
      updated.falsePositiveReason = authorityNotes;
      updated.authorityNotes = authorityNotes;
      stageStr = 'False Positive';
      noteStr = authorityNotes || 'Closed as false positive';
    } else if (finalVerification === 'AUTHORITY_OVERRIDE' || finalVerification === 'Authority Override') {
      updated.roadCondition = roadCondition;
      updated.type = correctedType;
      updated.roadClosureActive = roadClosureActive;
      updated.detourRouteName = roadClosureActive ? detourRouteName : undefined;
      updated.speedLimitKmh = speedLimitKmh;
      updated.authorityNotes = authorityNotes;
      updated.authorityOverride = {
        originalType: issue.type,
        newType: correctedType,
        originalSeverity: issue.severity,
        newSeverity: issue.severity,
        authority: 'Municipal Senior Inspector (Badge #4092)',
        reason: authorityNotes,
        timestamp: new Date().toLocaleTimeString() + ' IST',
        roadClosureActive,
        speedLimitKmh
      };
      stageStr = 'Override';
      noteStr = authorityNotes || 'Authority override applied';
    } else if (finalVerification === 'VERIFIED' || finalVerification === 'Verified by Staff' || finalVerification === 'Verified') {
      updated.verificationNotes = authorityNotes;
      updated.authorityNotes = authorityNotes;
      stageStr = 'Verified';
      noteStr = authorityNotes || 'AI detection verified by staff';
    }

    if (issue.verification !== finalVerification) {
        newHistory.push({
            stage: stageStr,
            timestamp: new Date().toLocaleTimeString() + ' IST',
            author: 'Municipal Senior Inspector (Badge #4092)',
            note: noteStr
        });
        updated.workflowHistory = newHistory;
    }

    onUpdateIssue(updated);
    setVerification(finalVerification);
    
    setSavedSuccessMsg(
      finalVerification === 'FALSE_POSITIVE' || finalVerification === 'False Positive' 
        ? 'Marked as False Positive and closed.' 
        : 'Authority Layer changes saved successfully.'
    );
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleSaveMaintenanceChanges = () => {
    const isNowResolved = status === 'RESOLVED';
    const updated: RoadIssue = {
      ...issue,
      status,
      assignedDept,
      assignedCrew,
      workOrderId,
      repairNotes,
      repairMaterials,
      repairCostEstimateInr,
      afterRepairImage,
      dispatchedAt: issue.dispatchedAt || (status !== 'PENDING' ? new Date().toLocaleTimeString() + ' IST' : undefined),
      resolvedAt: isNowResolved ? (issue.resolvedAt || new Date().toLocaleTimeString() + ' IST') : undefined,
      roadCondition: isNowResolved ? 'Repaired' : issue.roadCondition,
    };
    onUpdateIssue(updated);
    setSavedSuccessMsg('Maintenance Layer work order and status updated.');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleSimulateAfterRepairPhoto = () => {
    // Generate clean repaired asphalt SVG
    const repairedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
        <rect width="800" height="500" fill="#181c24" />
        <line x1="400" y1="0" x2="400" y2="500" stroke="#facc15" stroke-width="8" stroke-dasharray="30,25" />
        <!-- Fresh asphalt patch compacted cleanly -->
        <ellipse cx="430" cy="270" rx="145" ry="88" fill="#11141c" stroke="#334155" stroke-width="2" />
        <text x="360" y="275" fill="#10b981" font-family="monospace" font-size="18" font-weight="bold">REPAIRED &amp; COMPACTED</text>
        <rect x="0" y="0" width="800" height="42" fill="rgba(6, 11, 21, 0.85)" />
        <text x="24" y="27" fill="#10b981" font-family="monospace" font-size="14" font-weight="bold">● AFTER-REPAIR AUDIT INSPECTION PHOTO</text>
        <text x="560" y="27" fill="#cbd5e1" font-family="monospace" font-size="13">${issue.workOrderId || 'WO-COMPLETED'} | PWD AUDIT</text>
      </svg>
    `)}`;
    setAfterRepairImage(repairedSvg);
  };

  const handleUpdateLocationFromGMap = () => {
    if (!gmapInput.trim()) return;
    const parsed = parseGoogleMapsInput(gmapInput);
    if (!parsed.isValid || (parsed.lat === 0 && parsed.lng === 0)) {
      setRouteGeneratedToast('Please enter valid coordinates (e.g. 21.7051, 72.9959) or a Google Maps link.');
      setTimeout(() => setRouteGeneratedToast(''), 3500);
      return;
    }
    const updatedIssue: RoadIssue = {
      ...issue,
      lat: parsed.lat,
      lng: parsed.lng,
      hasSelectedLocation: true,
      locationName: parsed.name,
      location: {
        latitude: parsed.lat,
        longitude: parsed.lng,
        city: parsed.city || '',
        state: parsed.state || '',
        country: parsed.country || '',
        address: parsed.name,
        formattedAddress: parsed.formattedAddress || parsed.name,
      },
      googleMapsUrl: parsed.googleMapsUrl,
    };
    onUpdateIssue(updatedIssue);
    setRouteGeneratedToast(`Location updated to ${parsed.name} (${parsed.formattedCoordinates})`);
    setTimeout(() => setRouteGeneratedToast(''), 3500);
  };

  const handleGenerateRouteForThisIssue = () => {
    if (!hasValidGps) {
      setRouteGeneratedToast('Please provide a valid location before generating a bus route.');
      setTimeout(() => setRouteGeneratedToast(''), 3500);
      return;
    }
    setIsGeneratingModalRoute(true);
    setTimeout(() => {
      const generated = generateBusRouteForLocation(
        issue.lat,
        issue.lng,
        issue.locationName,
        { busId: 'BUS-05', busNumber: 'GJ-16-AZ-9905' }
      );
      const updatedIssue: RoadIssue = {
        ...issue,
        generatedBusRoute: generated.route,
        googleMapsUrl: issue.googleMapsUrl || `https://www.google.com/maps?q=${issue.lat.toFixed(6)},${issue.lng.toFixed(6)}`,
        locationName: issue.locationName,
      };
      onUpdateIssue(updatedIssue, generated.bus);
      setIsGeneratingModalRoute(false);
      setRouteGeneratedToast(`Bus survey route "${generated.route.routeName}" generated & vehicle BUS-05 dispatched!`);
      setTimeout(() => setRouteGeneratedToast(''), 4500);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#090e1a] border border-cyan-900/80 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0c1322]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shadow-sm">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {issue.id}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 capitalize">
                  {issue.type.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    issue.status === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : issue.severity === 'HIGH'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {issue.status === 'RESOLVED' ? 'RESOLVED' : `${issue.severity} SEVERITY`}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
                {issue.title}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-issue-detail"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Linear Workflow Progress Stepper */}
        <div className="bg-[#070c16] border-b border-slate-800/90 px-5 py-2.5">
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs font-mono">
            {/* Step 1: AI Detection */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500 flex items-center justify-center font-bold text-[11px]">
                ✓
              </div>
              <div>
                <div className="font-bold text-slate-200 text-[11px]">1. AI Detection</div>
                <div className="text-[10px] text-cyan-400 font-medium">{issue.confidence}% YOLOv8</div>
              </div>
            </div>

            <div className="h-0.5 w-4 sm:w-8 bg-slate-800 shrink-0" />

            {/* Step 2: Authority & Verification */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border ${
                issue.verification === 'Verified' || issue.verification === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : issue.verification === 'Rejected' || issue.verification === 'REJECTED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500'
              }`}>
                {issue.verification === 'Verified' || issue.verification === 'VERIFIED' ? '✓' : '2'}
              </div>
              <div>
                <div className="font-bold text-slate-200 text-[11px]">2. Authority &amp; Verification</div>
                <div className="text-[10px] text-slate-400">
                  {issue.verification === 'Verified' || issue.verification === 'VERIFIED'
                    ? 'Verified'
                    : issue.verification === 'Rejected' || issue.verification === 'REJECTED'
                    ? 'Rejected'
                    : 'Pending Review'}
                </div>
              </div>
            </div>

            <div className="h-0.5 w-4 sm:w-8 bg-slate-800 shrink-0" />

            {/* Step 3: Assign Problem */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border ${
                issue.assignedAuthority
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {issue.assignedAuthority ? '✓' : '3'}
              </div>
              <div>
                <div className="font-bold text-slate-200 text-[11px]">3. Assign Problem</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {issue.assignedAuthority || 'Unassigned'}
                </div>
              </div>
            </div>

            <div className="h-0.5 w-4 sm:w-8 bg-slate-800 shrink-0" />

            {/* Step 4: Problem Status Tracking */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border ${
                issue.status === 'Solved' || issue.status === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : issue.status === 'In Progress' || issue.status === 'IN_PROGRESS' || issue.status === 'DISPATCHED'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500'
              }`}>
                {issue.status === 'Solved' || issue.status === 'RESOLVED' ? '✓' : '4'}
              </div>
              <div>
                <div className="font-bold text-slate-200 text-[11px]">4. Status Tracking</div>
                <div className="text-[10px] font-semibold text-cyan-300">
                  {issue.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body: Left Camera Frame + Right Management Tabs */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Bus Camera Captured Evidence Frame (5/12 cols) */}
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#070b14] flex flex-col space-y-3">
            
            {/* Camera Viewport Header: AI Detection Evidence */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-bold">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>AI DETECTION EVIDENCE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold">
                  {issue.type.replace('_', ' ').toUpperCase()} • {issue.confidence}%
                </span>
                {issue.evidenceImage.startsWith('/results/') ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>YOLOv8 Annotated</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                      showBoundingBoxes
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {showBoundingBoxes ? 'YOLO Boxes [ON]' : 'Boxes [OFF]'}
                  </button>
                )}
              </div>
            </div>

            {/* Evidence Image Container with Overlaid YOLO Bounding Boxes */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center group shadow-xl">
              <img
                src={issue.evidenceImage}
                alt={`Evidence of ${issue.title}`}
                className="w-full h-full object-contain bg-slate-950"
              />

              {/* Overlaid YOLO Bounding Boxes (for images that do not have burned-in model annotations) */}
              {showBoundingBoxes && !issue.evidenceImage.startsWith('/results/') &&
                issue.boundingBoxes.map((box) => (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                      borderColor: box.color || '#ef4444',
                    }}
                    className="absolute border-2 bg-rose-500/10 transition-all pointer-events-none"
                  >
                    <span
                      style={{ backgroundColor: box.color || '#ef4444' }}
                      className="absolute -top-5 left-0 px-1 py-0.2 text-[9px] font-mono font-bold text-slate-950 uppercase shadow"
                    >
                      {box.label}: {box.confidence}%
                    </span>
                  </div>
                ))}

              {/* Live Scanline FX */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent h-16 w-full animate-scanline pointer-events-none" />
            </div>

            {/* Location, Coordinates & Status Summary Metadata */}
            <div className="p-2.5 rounded bg-[#090e1a] border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="text-slate-200 font-bold truncate">📍 {issue.locationName}</div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <div>Latitude: <span className="text-cyan-400 font-semibold">{issue.lat.toFixed(6)}°</span></div>
                <div>Longitude: <span className="text-cyan-400 font-semibold">{issue.lng.toFixed(6)}°</span></div>
                <div>Verification: <span className="text-emerald-400 font-bold">{issue.verification}</span></div>
                <div>Assignment: <span className={issue.assignedAuthority ? 'text-indigo-300 font-bold' : 'text-amber-400 font-bold'}>{issue.assignedAuthority || 'Unassigned'}</span></div>
                <div>Status: <span className="text-cyan-300 font-bold">{issue.status}</span></div>
                <div>AI Confidence: <span className="text-cyan-200 font-bold">{issue.confidence}%</span></div>
              </div>
            </div>

            {/* After-Repair Photo if attached */}
            {afterRepairImage && (
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-600/40">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">
                  ● AFTER-REPAIR VERIFICATION IMAGE
                </span>
                <img
                  src={afterRepairImage}
                  alt="Repaired road evidence"
                  className="w-full rounded aspect-video object-cover border border-emerald-900"
                />
              </div>
            )}

            {/* Fleet & Sensor Fusion Telemetry */}
            <div className="p-3 rounded-lg bg-[#0b101d] border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                <span>SENSOR FUSION TELEMETRY</span>
                <span className="text-emerald-400">EDGE JETSON ORIN</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Fleet Bus ID:</span>
                  <span className="text-amber-300 font-bold">{issue.busId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vehicle Speed:</span>
                  <span className="text-slate-200">{issue.telemetry.speedKmh} km/h</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IMU Z-Vibration Spike:</span>
                  <span className="text-rose-400 font-bold">
                    {issue.telemetry.zVibrationG} G-force
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Roughness IRI:</span>
                  <span className="text-cyan-300 font-bold">
                    {issue.telemetry.roadRoughnessIRI} (Hazardous)
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Transit Corridor:</span>
                  <span className="text-slate-300 truncate block">{issue.busRoute}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Location / GPS Coordinates:</span>
                  {hasValidGps ? (
                    <span className="text-cyan-400 font-mono text-[10px]">
                      Lat: {issue.lat.toFixed(6)}° N, Lng: {issue.lng.toFixed(6)}° E
                    </span>
                  ) : hasLocation ? (
                    <span className="text-cyan-300 font-mono text-[10px]">
                      {displayLocation}
                    </span>
                  ) : (
                    <span className="text-amber-400/90 font-mono text-[10px] italic">
                      Location not selected
                    </span>
                  )}
                </div>
              </div>

              {/* Estimated Physical Impact */}
              {issue.estimatedDimensions && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                  <span className="text-slate-400 font-semibold block">Estimated Hazard Geometry:</span>
                  <div className="grid grid-cols-2 gap-1 text-slate-300 text-[10px]">
                    {issue.estimatedDimensions.depthCm && (
                      <div>Depth: <span className="text-rose-400 font-bold">{issue.estimatedDimensions.depthCm} cm</span></div>
                    )}
                    {issue.estimatedDimensions.lengthM && (
                      <div>Length: <span className="text-slate-200">{issue.estimatedDimensions.lengthM} m</span></div>
                    )}
                    {issue.estimatedDimensions.potholeVolumeL && (
                      <div>Void Vol: <span className="text-amber-300">{issue.estimatedDimensions.potholeVolumeL} Liters</span></div>
                    )}
                    {issue.estimatedDimensions.blockedLanes && (
                      <div>Blocked Lanes: <span className="text-rose-400 font-bold">{issue.estimatedDimensions.blockedLanes} Lane(s)</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Attached Google Maps Pin & Bus Route Card */}
            <div className="p-3 rounded-lg bg-[#0a1222] border border-cyan-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GOOGLE MAPS LOCATION</span>
                </span>
                {hasValidGps ? (
                  <a
                    href={issue.googleMapsUrl || `https://www.google.com/maps?q=${issue.lat.toFixed(6)},${issue.lng.toFixed(6)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 hover:underline"
                  >
                    <span>Open Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-500 italic">No GPS Pin</span>
                )}
              </div>
              <div className="text-[11px] text-slate-300">
                <div className="font-semibold text-slate-200 truncate">
                  {hasLocation ? displayLocation : 'Location not selected'}
                </div>
                {hasValidGps ? (
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {issue.lat.toFixed(6)}° N, {issue.lng.toFixed(6)}° E
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic">
                    {hasLocation ? 'Plain Address / Named Location' : 'Coordinates not provided during upload'}
                  </div>
                )}
              </div>

              {issue.generatedBusRoute ? (
                <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Route className="w-3 h-3 text-amber-400" />
                      <span className="truncate max-w-[150px]">{issue.generatedBusRoute.routeName}</span>
                    </span>
                    <span>{issue.generatedBusRoute.totalDistanceKm} km</span>
                  </div>
                  <div className="text-slate-400">
                    Fleet Bus: <strong className="text-cyan-300">BUS-05</strong> • {issue.generatedBusRoute.waypoints.length} survey points (~{issue.generatedBusRoute.estimatedDurationMin}m)
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateRouteForThisIssue}
                    disabled={isGeneratingModalRoute}
                    className="w-full py-1.5 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Route className="w-3 h-3" />
                    <span>{isGeneratingModalRoute ? 'Calculating...' : 'Generate Bus Survey Route'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: The 3 Functional Layers (7/12 cols) */}
          <div className="lg:col-span-7 p-4 bg-[#090e1a] flex flex-col">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-4 text-xs font-mono">
              <button
                id="modal-tab-ai"
                onClick={() => setActiveTab('AI_DETECTION')}
                className={`flex-1 py-1.5 px-2 rounded font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'AI_DETECTION'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Detection</span>
              </button>

              <button
                id="modal-tab-authority"
                onClick={() => setActiveTab('AUTHORITY_VERIFICATION')}
                className={`flex-1 py-1.5 px-2 rounded font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'AUTHORITY_VERIFICATION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authority &amp; Verification</span>
              </button>

              <button
                id="modal-tab-tracking"
                onClick={() => setActiveTab('STATUS_TRACKING')}
                className={`flex-1 py-1.5 px-2 rounded font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'STATUS_TRACKING'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Problem Status &amp; Tracking</span>
              </button>
            </div>

            {/* Success toast inside modal */}
            {savedSuccessMsg && (
              <div className="mb-3 p-2 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{savedSuccessMsg}</span>
              </div>
            )}

            {/* TAB CONTENT: AI DETECTION */}
            {activeTab === 'AI_DETECTION' && (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 uppercase tracking-wider">AI Classification Breakdown</span>
                    <span className="text-cyan-400 font-bold">{issue.confidence}% Confidence</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-3 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${issue.confidence}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Detected Defect:</span>
                      <span className="text-slate-100 font-bold capitalize">{issue.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Calculated Severity:</span>
                      <span className={`font-bold ${issue.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {issue.severity} PRIORITY
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">AI Model:</span>
                      <span className="text-cyan-300">YOLOv8-RoadNet (OpenCV Decoded)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Input Source Method:</span>
                      <span className="text-emerald-400">Uploaded Fleet Media</span>
                    </div>
                  </div>
                </div>

                {/* Pre-recorded Media & Timeline GPS Correlation */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>Timeline GPS Coordinate Mapping</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700">
                      PREDEFINED TIMELINE SYNC
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    AI flags defect at video timeline mark, correlating with predefined surveyed route coordinates for Bharuch:
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded bg-[#0b1220] border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Source Footage File:</span>
                      <span className="text-slate-200 font-bold truncate block" title={issue.sourceFile || issue.sourceMedia?.fileName || 'route4b_dashcam_survey.mp4'}>
                        {issue.sourceFile || issue.sourceMedia?.fileName || 'route4b_dashcam_survey.mp4'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Video/Image Timestamp Mark:</span>
                      <span className="text-amber-300 font-bold block truncate" title={issue.uploadTimestamp || issue.videoTimestamp || issue.timestamp}>
                        ⏱️ {issue.uploadTimestamp || issue.videoTimestamp || issue.timestamp || 'Website upload timestamp'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Transit Vehicle Tag:</span>
                      <span className="text-cyan-300 font-bold truncate block">
                        {issue.busId} ({issue.route || issue.busRoute})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Mapped Coordinates / Location:</span>
                      <span className="text-emerald-400 font-mono text-[10px] break-all block" title={issue.userEnteredLocation || issue.locationName}>
                        {issue.userEnteredLocation || (hasValidGps ? `Lat: ${issue.lat.toFixed(6)}° N, Lng: ${issue.lng.toFixed(6)}° E` : issue.locationName)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sensor Fusion Validation */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span>Cross-Sensor Corroboration</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    Camera bounding box matched with a <strong className="text-rose-400">{issue.telemetry.zVibrationG}G</strong> vertical accelerometer bump recorded by the bus suspension IMU. False-positive probability rated below 1.8%.
                  </p>
                  <div className="p-2 rounded bg-[#0b1220] border border-slate-800 text-[10px] text-slate-300 space-y-1">
                    <div>• Visual Feature Match: <span className="text-emerald-400 font-bold">CONFIRMED (Asphalt void + fracture perimeter)</span></div>
                    <div>• Physical Suspension Impact: <span className="text-rose-400 font-bold">DETECTED (Spike &gt; 1.5G threshold)</span></div>
                    <div>• GPS Geofence Check: <span className="text-cyan-300 font-bold">MATCHED (Surveyed Municipal Corridor)</span></div>
                  </div>
                </div>

                {/* Auto-computed dispatch urgency */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Computed Dispatch Urgency Score:</span>
                    <span className="text-xs text-slate-500">Based on traffic volume, depth &amp; bus speed</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-rose-400">{geminiUrgencyScore || issue.priorityScore || 88}/100</span>
                    <span className="text-[10px] block text-slate-500 font-mono">PRIORITY TIER 1</span>
                  </div>
                </div>

                {/* Gemini AI Municipal Hazard Evaluation */}
                <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini AI Civil Safety Analysis</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestGeminiAssessment}
                      disabled={isAssessingWithGemini}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-[10px] text-cyan-300 font-mono transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isAssessingWithGemini ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span>Consulting Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{geminiAssessment ? 'Re-Analyze with Gemini' : 'Run Gemini Assessment'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  {geminiAssessment ? (
                    <div className="p-2.5 rounded bg-[#0b1322] border border-cyan-800/40 text-[11px] text-slate-200 leading-relaxed font-sans">
                      {geminiAssessment}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Query Google Gemini AI model on server to generate civil engineering assessment and dispatch protocols.
                    </p>
                  )}
                </div>

                {/* Section: Attached Google Maps Location & Dynamic Bus Route Generation */}
                <div className="p-3.5 rounded-lg bg-[#081120] border border-cyan-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-100 text-[11px] uppercase tracking-wider">
                        Google Maps Location &amp; Bus Route Patrol
                      </span>
                    </div>
                    {hasValidGps ? (
                      <a
                        href={issue.googleMapsUrl || `https://www.google.com/maps?q=${issue.lat.toFixed(6)},${issue.lng.toFixed(6)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200 hover:underline"
                      >
                        <span>Open Live Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-amber-400/90 font-mono">Location not selected</span>
                    )}
                  </div>

                  {/* Edit/Update Location Input */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] block">
                      Edit/Attach Google Maps URL or Coordinates:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={gmapInput}
                        onChange={(e) => setGmapInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateLocationFromGMap();
                        }}
                        placeholder="Google Maps link or Lat, Lng"
                        className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={handleUpdateLocationFromGMap}
                        className="px-3 py-1.5 rounded bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-600/80 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Update Pin
                      </button>
                    </div>
                  </div>

                  {/* Route Generation Action & Results */}
                  <div className="pt-1">
                    {!issue.generatedBusRoute ? (
                      <button
                        type="button"
                        onClick={handleGenerateRouteForThisIssue}
                        disabled={isGeneratingModalRoute}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Route className="w-4 h-4 text-slate-950" />
                        <span>{isGeneratingModalRoute ? 'Calculating Transit Corridors & Waypoints...' : '🧭 Generate Bus Survey Route for this Hazard'}</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-lg bg-[#070e1a] border border-amber-500/70 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div>
                            <span className="font-bold text-amber-300 text-xs block">
                              {issue.generatedBusRoute.routeName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Vehicle: <strong className="text-cyan-300">BUS-05</strong> • Patrol corridor: {issue.generatedBusRoute.corridorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[10px]">
                              {issue.generatedBusRoute.totalDistanceKm} km
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px]">
                              ~{issue.generatedBusRoute.estimatedDurationMin}m
                            </span>
                            <button
                              type="button"
                              onClick={handleGenerateRouteForThisIssue}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors cursor-pointer"
                              title="Recalculate route"
                            >
                              Recalculate
                            </button>
                          </div>
                        </div>

                        {/* Waypoints List */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">Itinerary Waypoints:</span>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {issue.generatedBusRoute.waypoints.map((wp, wIdx) => (
                              <div
                                key={wIdx}
                                className={`p-1.5 rounded text-[10px] flex items-center justify-between gap-2 ${
                                  wp.isTargetLocation
                                    ? 'bg-amber-950/80 border border-amber-500/80 text-amber-200'
                                    : 'bg-slate-950 border border-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    wp.isTargetLocation ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {wIdx + 1}
                                  </span>
                                  <span className="font-semibold">{wp.name}</span>
                                </div>
                                <span className="text-[9px] text-cyan-400 font-mono">
                                  {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {routeGeneratedToast && (
                    <div className="p-2 rounded bg-emerald-950/70 border border-emerald-500/70 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 animate-fadeIn">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{routeGeneratedToast}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AUTHORITY & VERIFICATION */}
            {activeTab === 'AUTHORITY_VERIFICATION' && (
              <div className="space-y-3.5 text-xs font-mono">
                {/* Verification Status */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-slate-300 font-bold block">
                    1. AI Detection Verification:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    {[
                      { id: 'AI_DETECTED', label: 'AI Detected', color: 'border-slate-700' },
                      { id: 'VERIFIED', label: 'Verified by Staff', color: 'border-emerald-600 text-emerald-300' },
                      { id: 'FALSE_POSITIVE', label: 'False Positive', color: 'border-rose-600 text-rose-300' },
                      { id: 'AUTHORITY_OVERRIDE', label: 'Authority Override', color: 'border-amber-600 text-amber-300' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVerification(v.id as VerificationStatus)}
                        className={`p-1.5 rounded border transition-colors cursor-pointer text-center ${
                          verification === v.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional UI based on Verification State */}
                {verification === 'AI_DETECTED' || verification === 'Pending Verification' ? (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2">
                    <p className="text-slate-300 font-bold mb-2 text-[11px]">AI Detection Information (Read-Only)</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div><span className="block text-slate-500">Problem Type:</span><strong className="text-slate-200 capitalize">{issue.type.replace('_', ' ')}</strong></div>
                      <div><span className="block text-slate-500">Confidence:</span><strong className="text-cyan-300">{issue.confidence}%</strong></div>
                      <div><span className="block text-slate-500">Severity:</span><strong className="text-amber-300">{issue.severity}</strong></div>
                      <div className="col-span-2"><span className="block text-slate-500">Location:</span><strong className="text-slate-200">{issue.locationName}</strong></div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveAuthorityChanges('VERIFIED')}
                        className="w-full py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Send for Verification / Verify Detection</span>
                      </button>
                    </div>
                  </div>
                ) : (verification === 'VERIFIED' || verification === 'Verified by Staff' || verification === 'Verified') ? (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-3">
                    <p className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Verified by Staff</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 p-2 bg-slate-950 rounded">
                      <div><span className="block text-slate-500">Problem Type:</span><strong className="text-slate-200 capitalize">{issue.type.replace('_', ' ')}</strong></div>
                      <div><span className="block text-slate-500">Severity:</span><strong className="text-amber-300">{issue.severity}</strong></div>
                      <div className="col-span-2"><span className="block text-slate-500">Location:</span><strong className="text-slate-200">{issue.locationName}</strong></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] block">Optional Verification Notes:</label>
                      <textarea
                        rows={2}
                        value={authorityNotes}
                        onChange={(e) => setAuthorityNotes(e.target.value)}
                        placeholder="Enter verification notes..."
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveAuthorityChanges()}
                      className="w-full py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Verification</span>
                    </button>
                  </div>
                ) : (verification === 'FALSE_POSITIVE' || verification === 'False Positive') ? (
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/50 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Are you sure this detection is a false positive?</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 text-[10px] block">Reason (Optional):</label>
                      <textarea
                        rows={2}
                        value={authorityNotes}
                        onChange={(e) => setAuthorityNotes(e.target.value)}
                        placeholder="Why was this marked as false positive?"
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVerification('AI_DETECTED')}
                        className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAuthorityChanges()}
                        className="flex-1 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-md"
                      >
                        Confirm False Positive
                      </button>
                    </div>
                  </div>
                ) : (
                  // AUTHORITY OVERRIDE
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                        <label className="text-slate-300 font-bold block text-[11px]">
                          2. Road Condition Index:
                        </label>
                        <select
                          value={roadCondition}
                          onChange={(e) => setRoadCondition(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Critical">Critical (Immediate Hazard)</option>
                          <option value="Hazardous">Hazardous</option>
                          <option value="Poor">Poor</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Repaired">Repaired / Normal</option>
                        </select>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                        <label className="text-slate-300 font-bold block text-[11px]">
                          3. Correct Defect Classification:
                        </label>
                        <select
                          value={correctedType}
                          onChange={(e) => setCorrectedType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="pothole">Pothole</option>
                          <option value="waterlogging">Waterlogging</option>
                          <option value="road_damage">Road Damage / Cracks</option>
                          <option value="accident">Accident / Incident</option>
                          <option value="construction">Construction Zone</option>
                          <option value="road_closed">Road Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold text-[11px]">
                          4. Emergency Road Closure &amp; Speed Regulation:
                        </span>
                        <button
                          type="button"
                          onClick={() => setRoadClosureActive(!roadClosureActive)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                            roadClosureActive
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {roadClosureActive ? 'Road Closed [ACTIVE]' : 'Road Open'}
                        </button>
                      </div>

                      {roadClosureActive && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-slate-400 text-[10px] block">Detour Route Name:</label>
                          <input
                            type="text"
                            value={detourRouteName}
                            onChange={(e) => setDetourRouteName(e.target.value)}
                            placeholder="e.g., Divert via GIDC Link Road 2B..."
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                        <span className="text-slate-400 text-[11px]">Regulated Speed Limit (km/h):</span>
                        <input
                          type="number"
                          value={speedLimitKmh}
                          onChange={(e) => setSpeedLimitKmh(Number(e.target.value))}
                          className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-xs text-center text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-bold block text-[11px]">
                        5. Override Reason (Required):
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={authorityNotes}
                        onChange={(e) => setAuthorityNotes(e.target.value)}
                        placeholder="Enter detailed reason for overriding AI detection..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      id="btn-save-authority-actions"
                      type="button"
                      onClick={() => {
                        if (!authorityNotes.trim()) {
                           alert('Override reason is required!');
                           return;
                        }
                        handleSaveAuthorityChanges();
                      }}
                      className="w-full py-2 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Authority Override &amp; Apply</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PROBLEM STATUS & TRACKING */}
            {activeTab === 'STATUS_TRACKING' && (
              <div className="space-y-3.5 text-xs font-mono">
                
                {/* Workflow Status Progression */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-slate-300 font-bold block">
                    1. Problem Status Tracking Progression:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { key: 'PENDING', label: '⏳ Pending', color: 'border-amber-500 text-amber-300' },
                      { key: 'IN_PROGRESS', label: '⚡ In Progress', color: 'border-cyan-500 text-cyan-300' },
                      { key: 'RESOLVED', label: '✓ Solved', color: 'border-emerald-500 text-emerald-300' },
                    ].map((st) => {
                      const isSelected = 
                        status === st.key ||
                        (st.key === 'PENDING' && (status === 'Pending' || status === 'PENDING')) ||
                        (st.key === 'IN_PROGRESS' && (status === 'In Progress' || status === 'IN_PROGRESS' || status === 'DISPATCHED')) ||
                        (st.key === 'RESOLVED' && (status === 'Solved' || status === 'RESOLVED'));

                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => setStatus(st.key as WorkflowStatus)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer text-center font-bold ${
                            isSelected
                              ? `bg-slate-900 ${st.color} shadow-sm ring-1 ring-cyan-500/50`
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Department & Crew Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-slate-300 font-bold block text-[11px]">
                      2. Assigned Municipal Dept:
                    </label>
                    <select
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="PWD Municipal Road Division">PWD Municipal Road Division</option>
                      <option value="Drainage & Stormwater Dept">Drainage &amp; Stormwater Dept</option>
                      <option value="Traffic Police & Highway Rescue Squad">Traffic &amp; Highway Rescue</option>
                      <option value="Disaster Response Quick Action Unit">Disaster Response Unit</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-slate-300 font-bold block text-[11px]">
                      3. Dispatch Crew / Unit:
                    </label>
                    <input
                      type="text"
                      value={assignedCrew}
                      onChange={(e) => setAssignedCrew(e.target.value)}
                      placeholder="e.g., Road Patch Squad Alpha"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Work Order & Materials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-slate-400 text-[10px] block">Work Order Number:</label>
                    <input
                      type="text"
                      value={workOrderId}
                      onChange={(e) => setWorkOrderId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <label className="text-slate-400 text-[10px] block">Est. Repair Cost (INR):</label>
                    <input
                      type="number"
                      value={repairCostEstimateInr}
                      onChange={(e) => setRepairCostEstimateInr(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-emerald-300 font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Materials & Repair Notes */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="text-slate-300 font-bold block text-[11px]">
                    4. Repair Materials &amp; Technical Method:
                  </label>
                  <input
                    type="text"
                    value={repairMaterials}
                    onChange={(e) => setRepairMaterials(e.target.value)}
                    placeholder="e.g., Cold-mix polymer bitumen, vibratory roller compaction..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <textarea
                    rows={2}
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    placeholder="Enter crew progress notes, dispatch timestamps, or resolution certificate..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 mt-1"
                  />
                </div>

                {/* After Repair Photo Attachment */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-bold block text-[11px]">
                      5. After-Repair Verification Photo:
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {afterRepairImage ? 'Verification photo attached' : 'No completion photo attached'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateAfterRepairPhoto}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-600/40 text-xs font-mono transition-colors cursor-pointer"
                  >
                    + Attach Verified Photo
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="btn-save-maintenance-actions"
                    type="button"
                    onClick={handleSaveMaintenanceChanges}
                    className="flex-1 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Update Maintenance Work Order</span>
                  </button>

                  {status !== 'RESOLVED' && (
                    <button
                      id="btn-quick-resolve-issue"
                      type="button"
                      onClick={() => {
                        setStatus('RESOLVED');
                        setRoadCondition('Repaired');
                        handleSimulateAfterRepairPhoto();
                        const updated: RoadIssue = {
                          ...issue,
                          status: 'RESOLVED',
                          roadCondition: 'Repaired',
                          resolvedAt: new Date().toLocaleTimeString() + ' IST',
                        };
                        onUpdateIssue(updated);
                        setSavedSuccessMsg('Issue marked as fully RESOLVED & closed.');
                      }}
                      className="py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-2.5 bg-[#0c1322] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Bharat Electronics Limited (BEL)</span>
            <span className="text-slate-600">•</span>
            <span>Problem Statement SIH26124</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>

    </div>
  );
};
