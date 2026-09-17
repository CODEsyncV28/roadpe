import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface BezierCurve {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

interface RouteSample {
  x: number;
  y: number;
  angle: number;
  dist: number;
}

interface AbstractRoute {
  id: string;
  name: string;
  samples: RouteSample[];
  totalLength: number;
  color: string;
  dashed?: boolean;
}

interface MovingDot {
  routeId: string;
  progress: number;
  speed: number;
  size: number;
  color: string;
}

interface TinyBus {
  id: string;
  routeId: string;
  progress: number;
  speed: number;
  direction: 1 | -1;
  color: string;
}

interface NetworkNode {
  x: number;
  y: number;
  baseRadius: number;
  color: string;
  phase: number;
  hasRing?: boolean;
  pulseSpeed?: number;
}

interface SubtleAlert {
  x: number;
  y: number;
  color: string;
  phase: number;
  type: 'CRITICAL' | 'WARNING' | 'STATION';
}

interface RoutePulse {
  routeId: string;
  progress: number;
  speed: number;
  color: string;
  cycleInterval: number;
}

export const TransitNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let routes: AbstractRoute[] = [];
    let movingDots: MovingDot[] = [];
    let tinyBuses: TinyBus[] = [];
    let nodes: NetworkNode[] = [];
    let alerts: SubtleAlert[] = [];
    let pulses: RoutePulse[] = [];

    // Helper: Point on cubic Bezier curve
    const getCubicBezier = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      return {
        x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
        y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
      };
    };

    // Helper: Tangent angle on cubic Bezier curve
    const getCubicBezierAngle = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): number => {
      const u = 1 - t;
      const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
      const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
      return Math.atan2(dy, dx);
    };

    // Pre-sample spline routes uniformly for smooth, constant-velocity motion
    const createSpline = (
      id: string,
      name: string,
      curves: BezierCurve[],
      color: string,
      dashed = false
    ): AbstractRoute => {
      const samples: RouteSample[] = [];
      let totalLength = 0;

      curves.forEach((curve) => {
        const steps = 90;
        let prevPt = curve.p0;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const pt = getCubicBezier(curve.p0, curve.p1, curve.p2, curve.p3, t);
          const angle = getCubicBezierAngle(curve.p0, curve.p1, curve.p2, curve.p3, t);

          if (samples.length > 0) {
            totalLength += Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
          }

          samples.push({ x: pt.x, y: pt.y, angle, dist: totalLength });
          prevPt = pt;
        }
      });

      return { id, name, samples, totalLength, color, dashed };
    };

    // Interpolate point along sampled spline by arc length distance
    const getPointAtDist = (route: AbstractRoute, dist: number): { x: number; y: number; angle: number } => {
      const samples = route.samples;
      if (samples.length === 0) return { x: 0, y: 0, angle: 0 };

      const norm = ((dist % route.totalLength) + route.totalLength) % route.totalLength;

      let low = 0;
      let high = samples.length - 1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (samples[mid].dist < norm) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      const idx = Math.max(0, Math.min(samples.length - 2, low - 1));
      const s0 = samples[idx];
      const s1 = samples[idx + 1];
      const seg = s1.dist - s0.dist;
      const factor = seg > 0.001 ? (norm - s0.dist) / seg : 0;

      return {
        x: s0.x + (s1.x - s0.x) * factor,
        y: s0.y + (s1.y - s0.y) * factor,
        angle: s0.angle + (s1.angle - s0.angle) * factor,
      };
    };

    // Setup abstract network geometry:
    // 10 interconnected routes (4 original + 6 new routes: 2-3 horizontal, 1-2 diagonal, 1 curved orbital, 1 branching, 1 secondary feeder)
    const initNetwork = () => {
      const w = width;
      const h = height;

      // --- ROUTE 1: Northern Arterial (Existing - gentle curve through upper quadrant) ---
      const c1: BezierCurve[] = [
        {
          p0: { x: -w * 0.04, y: h * 0.28 },
          p1: { x: w * 0.26, y: h * 0.18 },
          p2: { x: w * 0.54, y: h * 0.32 },
          p3: { x: w * 0.82, y: h * 0.20 },
        },
        {
          p0: { x: w * 0.82, y: h * 0.20 },
          p1: { x: w * 0.94, y: h * 0.15 },
          p2: { x: w * 1.02, y: h * 0.18 },
          p3: { x: w * 1.08, y: h * 0.16 },
        },
      ];

      // --- ROUTE 2: Central Loop (Existing - soft S-curve through central zone) ---
      const c2: BezierCurve[] = [
        {
          p0: { x: -w * 0.05, y: h * 0.48 },
          p1: { x: w * 0.22, y: h * 0.42 },
          p2: { x: w * 0.42, y: h * 0.56 },
          p3: { x: w * 0.65, y: h * 0.46 },
        },
        {
          p0: { x: w * 0.65, y: h * 0.46 },
          p1: { x: w * 0.82, y: h * 0.40 },
          p2: { x: w * 0.96, y: h * 0.58 },
          p3: { x: w * 1.08, y: h * 0.52 },
        },
      ];

      // --- ROUTE 3: Southern Spine (Existing - bottom horizontal corridor) ---
      const c3: BezierCurve[] = [
        {
          p0: { x: -w * 0.04, y: h * 0.76 },
          p1: { x: w * 0.28, y: h * 0.84 },
          p2: { x: w * 0.58, y: h * 0.72 },
          p3: { x: w * 0.85, y: h * 0.82 },
        },
        {
          p0: { x: w * 0.85, y: h * 0.82 },
          p1: { x: w * 0.96, y: h * 0.86 },
          p2: { x: w * 1.02, y: h * 0.78 },
          p3: { x: w * 1.08, y: h * 0.74 },
        },
      ];

      // --- ROUTE 4: Diagonal Cross-Link (Existing - thin connector between R1, R2, and R3) ---
      const c4: BezierCurve[] = [
        {
          p0: { x: w * 0.26, y: h * 0.18 },
          p1: { x: w * 0.32, y: h * 0.36 },
          p2: { x: w * 0.42, y: h * 0.56 },
          p3: { x: w * 0.58, y: h * 0.72 },
        },
      ];

      // --- ROUTE 5: Upper North Skyline Crosstown (NEW Horizontal 1) ---
      const c5: BezierCurve[] = [
        {
          p0: { x: -w * 0.03, y: h * 0.12 },
          p1: { x: w * 0.20, y: h * 0.14 },
          p2: { x: w * 0.48, y: h * 0.10 },
          p3: { x: w * 0.75, y: h * 0.14 },
        },
        {
          p0: { x: w * 0.75, y: h * 0.14 },
          p1: { x: w * 0.88, y: h * 0.12 },
          p2: { x: w * 0.98, y: h * 0.11 },
          p3: { x: w * 1.06, y: h * 0.09 },
        },
      ];

      // --- ROUTE 6: Lower Mid Crosstown (NEW Horizontal 2) ---
      const c6: BezierCurve[] = [
        {
          p0: { x: -w * 0.03, y: h * 0.64 },
          p1: { x: w * 0.24, y: h * 0.60 },
          p2: { x: w * 0.50, y: h * 0.65 },
          p3: { x: w * 0.74, y: h * 0.61 },
        },
        {
          p0: { x: w * 0.74, y: h * 0.61 },
          p1: { x: w * 0.88, y: h * 0.64 },
          p2: { x: w * 0.98, y: h * 0.63 },
          p3: { x: w * 1.05, y: h * 0.66 },
        },
      ];

      // --- ROUTE 7: Northwest-to-Southeast Trunk (NEW Diagonal 1) ---
      // Sweeps across the map intersecting R1, R2, R6, and R3
      const c7: BezierCurve[] = [
        {
          p0: { x: w * 0.08, y: -h * 0.02 },
          p1: { x: w * 0.22, y: h * 0.22 },
          p2: { x: w * 0.42, y: h * 0.44 },
          p3: { x: w * 0.68, y: h * 0.66 },
        },
        {
          p0: { x: w * 0.68, y: h * 0.66 },
          p1: { x: w * 0.78, y: h * 0.76 },
          p2: { x: w * 0.86, y: h * 0.86 },
          p3: { x: w * 0.94, y: h * 1.03 },
        },
      ];

      // --- ROUTE 8: Western Orbital Curved Bypass (NEW Curved Route) ---
      // Sweeping semi-circular bypass wrapping around western sector
      const c8: BezierCurve[] = [
        {
          p0: { x: w * 0.20, y: h * 0.06 },
          p1: { x: w * 0.06, y: h * 0.28 },
          p2: { x: w * 0.05, y: h * 0.56 },
          p3: { x: w * 0.16, y: h * 0.78 },
        },
        {
          p0: { x: w * 0.16, y: h * 0.78 },
          p1: { x: w * 0.22, y: h * 0.88 },
          p2: { x: w * 0.36, y: h * 0.90 },
          p3: { x: w * 0.46, y: h * 0.93 },
        },
      ];

      // --- ROUTE 9: Eastern Harbor Branch (NEW Branching Route) ---
      // Branches off R2 at junction node (w * 0.65, h * 0.46) and splits northeast
      const c9: BezierCurve[] = [
        {
          p0: { x: w * 0.65, y: h * 0.46 },
          p1: { x: w * 0.74, y: h * 0.38 },
          p2: { x: w * 0.86, y: h * 0.32 },
          p3: { x: w * 1.04, y: h * 0.34 },
        },
      ];

      // --- ROUTE 10: South-Central Feeder (NEW Shorter Secondary Route) ---
      // Short connector linking R6 and R3
      const c10: BezierCurve[] = [
        {
          p0: { x: w * 0.50, y: h * 0.65 },
          p1: { x: w * 0.58, y: h * 0.69 },
          p2: { x: w * 0.66, y: h * 0.74 },
          p3: { x: w * 0.68, y: h * 0.84 },
        },
      ];

      routes = [
        createSpline('R1', 'Northern Arterial', c1, 'rgba(6, 182, 212, 0.17)'),
        createSpline('R2', 'Central Metro Loop', c2, 'rgba(14, 165, 233, 0.16)'),
        createSpline('R3', 'Southern Spine', c3, 'rgba(45, 212, 191, 0.14)'),
        createSpline('R4', 'Central Diagonal Connector', c4, 'rgba(56, 189, 248, 0.12)', true),
        createSpline('R5', 'North Skyline Crosstown', c5, 'rgba(14, 165, 233, 0.13)'),
        createSpline('R6', 'Lower Mid Crosstown', c6, 'rgba(6, 182, 212, 0.15)'),
        createSpline('R7', 'NW-SE Trunk Diagonal', c7, 'rgba(45, 212, 191, 0.14)'),
        createSpline('R8', 'Western Orbital Bypass', c8, 'rgba(56, 189, 248, 0.13)'),
        createSpline('R9', 'Eastern Harbor Branch', c9, 'rgba(14, 165, 233, 0.15)', true),
        createSpline('R10', 'South-Central Feeder', c10, 'rgba(45, 212, 191, 0.12)', true),
      ];

      // 2. Interconnected Glowing Nodes at Key Junctions (subtle, breathing)
      nodes = [
        // R1 / R4 Junction
        { x: w * 0.26, y: h * 0.18, baseRadius: 2.5, color: '#00f0ff', phase: 0, hasRing: true },
        // R1 Mid
        { x: w * 0.54, y: h * 0.32, baseRadius: 2.0, color: '#38bdf8', phase: 1.2 },
        // R1 East
        { x: w * 0.82, y: h * 0.20, baseRadius: 2.5, color: '#00f0ff', phase: 2.4, hasRing: true },
        // R5 / R8 Junction North
        { x: w * 0.20, y: h * 0.14, baseRadius: 2.0, color: '#2dd4bf', phase: 0.6 },
        // R5 Northeast Junction
        { x: w * 0.75, y: h * 0.14, baseRadius: 2.2, color: '#38bdf8', phase: 3.2 },
        // R2 West
        { x: w * 0.22, y: h * 0.42, baseRadius: 2.0, color: '#38bdf8', phase: 0.8 },
        // R2 / R4 Central Hub
        { x: w * 0.42, y: h * 0.56, baseRadius: 2.6, color: '#2dd4bf', phase: 1.9, hasRing: true },
        // R2 / R9 Branching Junction
        { x: w * 0.65, y: h * 0.46, baseRadius: 2.4, color: '#00f0ff', phase: 3.1, hasRing: true },
        // R9 East
        { x: w * 0.86, y: h * 0.32, baseRadius: 1.8, color: '#38bdf8', phase: 2.0 },
        // R6 / R10 Junction
        { x: w * 0.50, y: h * 0.65, baseRadius: 2.2, color: '#00f0ff', phase: 1.5 },
        // R6 East
        { x: w * 0.74, y: h * 0.61, baseRadius: 2.0, color: '#2dd4bf', phase: 4.1 },
        // R7 / R6 Diagonal Intersection
        { x: w * 0.68, y: h * 0.66, baseRadius: 2.3, color: '#38bdf8', phase: 2.8 },
        // R4 / R3 South Hub
        { x: w * 0.58, y: h * 0.72, baseRadius: 2.5, color: '#00f0ff', phase: 4.0, hasRing: true },
        // R3 East
        { x: w * 0.85, y: h * 0.82, baseRadius: 2.0, color: '#2dd4bf', phase: 2.7 },
        // R8 Western Apex
        { x: w * 0.05, y: h * 0.56, baseRadius: 2.1, color: '#38bdf8', phase: 1.1 },
        // R10 / R3 South Join
        { x: w * 0.68, y: h * 0.84, baseRadius: 1.8, color: '#2dd4bf', phase: 3.5 },
      ];

      // 3. Moving Cyan / Teal Telemetry Dots (Asynchronous, varied speeds)
      movingDots = [
        { routeId: 'R1', progress: routes[0]?.totalLength * 0.15 || 80, speed: 0.34, size: 1.8, color: '#00f0ff' },
        { routeId: 'R1', progress: routes[0]?.totalLength * 0.68 || 450, speed: 0.28, size: 1.6, color: '#38bdf8' },
        { routeId: 'R2', progress: routes[1]?.totalLength * 0.42 || 260, speed: 0.32, size: 1.8, color: '#00f0ff' },
        { routeId: 'R3', progress: routes[2]?.totalLength * 0.55 || 340, speed: 0.26, size: 1.6, color: '#2dd4bf' },
        { routeId: 'R5', progress: routes[4]?.totalLength * 0.30 || 180, speed: 0.30, size: 1.6, color: '#38bdf8' },
        { routeId: 'R6', progress: routes[5]?.totalLength * 0.72 || 420, speed: 0.33, size: 1.7, color: '#00f0ff' },
        { routeId: 'R7', progress: routes[6]?.totalLength * 0.25 || 150, speed: 0.35, size: 1.8, color: '#2dd4bf' },
        { routeId: 'R8', progress: routes[7]?.totalLength * 0.50 || 320, speed: 0.25, size: 1.6, color: '#38bdf8' },
        { routeId: 'R9', progress: routes[8]?.totalLength * 0.60 || 160, speed: 0.29, size: 1.6, color: '#00f0ff' },
      ];

      // 4. Tiny Bus / Fleet Silhouettes (12px length x 6px width, slow, subtle)
      tinyBuses = [
        {
          id: 'B1',
          routeId: 'R1',
          progress: routes[0]?.totalLength * 0.45 || 280,
          speed: 0.26,
          direction: 1,
          color: 'rgba(56, 189, 248, 0.65)',
        },
        {
          id: 'B2',
          routeId: 'R2',
          progress: routes[1]?.totalLength * 0.78 || 520,
          speed: 0.23,
          direction: -1,
          color: 'rgba(0, 240, 255, 0.65)',
        },
        {
          id: 'B3',
          routeId: 'R3',
          progress: routes[2]?.totalLength * 0.25 || 160,
          speed: 0.24,
          direction: 1,
          color: 'rgba(45, 212, 191, 0.65)',
        },
        {
          id: 'B4',
          routeId: 'R6',
          progress: routes[5]?.totalLength * 0.35 || 220,
          speed: 0.25,
          direction: 1,
          color: 'rgba(56, 189, 248, 0.65)',
        },
        {
          id: 'B5',
          routeId: 'R7',
          progress: routes[6]?.totalLength * 0.62 || 380,
          speed: 0.22,
          direction: -1,
          color: 'rgba(0, 240, 255, 0.65)',
        },
        {
          id: 'B6',
          routeId: 'R8',
          progress: routes[7]?.totalLength * 0.18 || 120,
          speed: 0.24,
          direction: 1,
          color: 'rgba(45, 212, 191, 0.65)',
        },
      ];

      // 5. Very Subtle Telemetry Warning Points (rare, slow, soft breathing)
      alerts = [
        { x: w * 0.65, y: h * 0.46, color: 'rgba(245, 158, 11, 0.6)', phase: 0, type: 'WARNING' },
        { x: w * 0.82, y: h * 0.20, color: 'rgba(239, 68, 68, 0.55)', phase: 2.5, type: 'CRITICAL' },
        { x: w * 0.42, y: h * 0.56, color: 'rgba(16, 185, 129, 0.55)', phase: 4.2, type: 'STATION' },
        { x: w * 0.50, y: h * 0.65, color: 'rgba(245, 158, 11, 0.55)', phase: 1.8, type: 'WARNING' },
      ];

      // 6. Occasional Subtle Route Pulses (slow, faint light wave traveling along selected routes)
      pulses = [
        { routeId: 'R1', progress: 0, speed: 1.1, color: 'rgba(0, 240, 255, 0.32)', cycleInterval: 250 },
        { routeId: 'R2', progress: -220, speed: 0.95, color: 'rgba(14, 165, 233, 0.28)', cycleInterval: 320 },
        { routeId: 'R6', progress: -450, speed: 1.05, color: 'rgba(45, 212, 191, 0.30)', cycleInterval: 280 },
        { routeId: 'R7', progress: -150, speed: 1.0, color: 'rgba(56, 189, 248, 0.28)', cycleInterval: 350 },
      ];
    };

    initNetwork();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNetwork();
    };

    window.addEventListener('resize', handleResize);

    let frame = 0;

    // Main slow, graceful 60fps render loop
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Deep dark navy/black canvas base (85-90% dark empty space)
      ctx.fillStyle = '#060a13';
      ctx.fillRect(0, 0, width, height);

      // Soft, subtle radial ambient depth
      const radialVignette = ctx.createRadialGradient(
        width * 0.48,
        height * 0.45,
        120,
        width * 0.5,
        height * 0.5,
        width * 0.88
      );
      radialVignette.addColorStop(0, 'rgba(8, 20, 38, 0.42)');
      radialVignette.addColorStop(0.6, 'rgba(6, 12, 22, 0.18)');
      radialVignette.addColorStop(1, 'rgba(4, 7, 14, 0)');
      ctx.fillStyle = radialVignette;
      ctx.fillRect(0, 0, width, height);

      // 1. Extremely faint background coordinate ticks (very sparse and subtle)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.025)';
      const gridGap = 120;
      for (let x = gridGap; x < width; x += gridGap) {
        for (let y = gridGap; y < height; y += gridGap) {
          ctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5);
        }
      }

      // 2. Faint Abstract Network Lines (Thin connected paths, 0.8px - 1.2px)
      routes.forEach((route) => {
        if (route.samples.length === 0) return;

        ctx.save();
        ctx.beginPath();
        route.samples.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });

        if (route.dashed) {
          ctx.setLineDash([3, 7]);
          ctx.strokeStyle = route.color;
          ctx.lineWidth = 0.85;
        } else {
          ctx.strokeStyle = route.color;
          ctx.lineWidth = 1.1;
        }
        ctx.stroke();
        ctx.restore();
      });

      // 3. Occasional Soft Route Pulses (faint wave cruising along route, staggered)
      pulses.forEach((pulse) => {
        const route = routes.find((r) => r.id === pulse.routeId);
        if (!route || route.totalLength === 0) return;

        pulse.progress += pulse.speed;
        if (pulse.progress > route.totalLength + 120) {
          // Pause between cycles for calmness
          pulse.progress = -Math.random() * pulse.cycleInterval - 150;
        }

        if (pulse.progress > 0 && pulse.progress < route.totalLength) {
          const pos = getPointAtDist(route, pulse.progress);
          const tailPos = getPointAtDist(route, Math.max(0, pulse.progress - 36));

          ctx.save();
          const grad = ctx.createLinearGradient(tailPos.x, tailPos.y, pos.x, pos.y);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
          grad.addColorStop(1, pulse.color);

          ctx.beginPath();
          ctx.moveTo(tailPos.x, tailPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();
        }
      });

      // 4. Small Glowing Nodes (subtle breathing animation, no flashing)
      nodes.forEach((node) => {
        const pulse = Math.sin(frame * 0.02 + node.phase) * 0.5 + 0.5;
        const alpha = 0.22 + pulse * 0.32;

        // Faint outer ring on key junction nodes
        if (node.hasRing) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.baseRadius + 4 + pulse * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.07 + pulse * 0.07})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        // Core tiny node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // 5. Very Subtle Telemetry Alerts (tiny, slow, soft breathing)
      alerts.forEach((alert) => {
        const pulse = Math.sin(frame * 0.022 + alert.phase) * 0.5 + 0.5;

        // Very faint ring
        ctx.beginPath();
        ctx.arc(alert.x, alert.y, 4 + pulse * 5, 0, Math.PI * 2);
        const ringColor = alert.color.replace('0.6', `${0.16 - pulse * 0.10}`).replace('0.55', `${0.14 - pulse * 0.09}`);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Tiny 2.2px alert dot
        ctx.beginPath();
        ctx.arc(alert.x, alert.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = alert.color;
        ctx.shadowColor = alert.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 6. Moving Cyan / Teal Telemetry Dots (moving slowly along abstract paths)
      movingDots.forEach((dot) => {
        const route = routes.find((r) => r.id === dot.routeId);
        if (!route || route.totalLength === 0) return;

        dot.progress = (dot.progress + dot.speed) % route.totalLength;
        const pos = getPointAtDist(route, dot.progress);

        // Faint comet trail (12px)
        const trailPos = getPointAtDist(route, dot.progress - 12);
        ctx.beginPath();
        ctx.moveTo(trailPos.x, trailPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Dot head
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 7. A Few Tiny Bus Silhouettes (12px x 6px minimal clean silhouette, moving slowly)
      tinyBuses.forEach((bus) => {
        const route = routes.find((r) => r.id === bus.routeId);
        if (!route || route.totalLength === 0) return;

        bus.progress = (bus.progress + bus.speed * bus.direction + route.totalLength) % route.totalLength;
        const pos = getPointAtDist(route, bus.progress);
        const heading = bus.direction === 1 ? pos.angle : pos.angle + Math.PI;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(heading);

        const bLen = 12;
        const bWid = 6;

        // Subtle tiny forward headlight hint (just 5px soft cone)
        const lightGrad = ctx.createLinearGradient(bLen / 2, 0, bLen / 2 + 7, 0);
        lightGrad.addColorStop(0, 'rgba(0, 240, 255, 0.16)');
        lightGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.moveTo(bLen / 2, -1.8);
        ctx.lineTo(bLen / 2 + 7, -3.5);
        ctx.lineTo(bLen / 2 + 7, 3.5);
        ctx.lineTo(bLen / 2, 1.8);
        ctx.closePath();
        ctx.fill();

        // Tiny bus body (dark navy interior with faint cyan outline)
        ctx.fillStyle = 'rgba(8, 16, 28, 0.9)';
        ctx.strokeStyle = bus.color;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.roundRect(-bLen / 2, -bWid / 2, bLen, bWid, 1.5);
        ctx.fill();
        ctx.stroke();

        // Front windshield line
        ctx.fillStyle = bus.color;
        ctx.fillRect(bLen / 2 - 2.5, -bWid / 2 + 1.2, 1.1, bWid - 2.4);

        // Tiny passenger window dots
        ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
        ctx.fillRect(-bLen / 2 + 2, -bWid / 2 + 1, 1.8, 1);
        ctx.fillRect(0, -bWid / 2 + 1, 1.8, 1);
        ctx.fillRect(-bLen / 2 + 2, bWid / 2 - 2, 1.8, 1);
        ctx.fillRect(0, bWid / 2 - 2, 1.8, 1);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      id="roadvision-transit-background"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
      style={{ pointerEvents: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
