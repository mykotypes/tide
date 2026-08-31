import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { BANDS, FOAM_BAND, PALE_BAND, THREAD_BANDS, bandBaseY, nextWetBaseY, shoreEdgeY, type Band } from '@/lib/shore-scene';

// Canvas2D re-implementation of the native ShoreScene (Skia + Reanimated
// worklets) — see docs/shore-scene-web-spike.md (ticket 04) for why: no
// CanvasKit-web WASM download, and the worklet split buys nothing on a
// single-threaded browser. Same pure math from lib/shore-scene.ts, driven
// by a plain requestAnimationFrame loop instead of a UI-thread clock.
//
// react-native's JSX types don't declare a `canvas` intrinsic (react-dom's
// does, but this file compiles against React Native's types), so the
// element is created directly rather than written as JSX.
const CANVAS = 'canvas';

const SAND_TOP = '#f5e0ac';
const SAND_BOTTOM = '#eed092';
const SAND_SPECK_COLOR = 'rgba(196,156,92,0.28)';
const WET_SAND_COLOR = 'rgba(214,172,110,0.55)';
const FOAM_THREAD_COLOR = 'rgba(255,255,255,0.35)';

const SAND_SPECK_COUNT = 40;
const BUBBLE_COUNT = 14;
const EDGE_STEP = 8;

interface SandSpeck {
  xFrac: number;
  yFrac: number;
  r: number;
}

function makeSandSpecks(count: number): SandSpeck[] {
  return Array.from({ length: count }, () => ({
    xFrac: Math.random(),
    yFrac: Math.random(),
    r: 0.8 + Math.random() * 1.3,
  }));
}

interface BubbleSeed {
  xFrac: number;
  offset: number;
  r: number;
  seed: number;
}

function makeBubbleSeeds(count: number): BubbleSeed[] {
  return Array.from({ length: count }, () => ({
    xFrac: 0.04 + Math.random() * 0.92,
    offset: 6 + Math.random() * 36,
    r: 1.4 + Math.random() * 2.2,
    seed: Math.random() * Math.PI * 2,
  }));
}

function traceEdgePath(ctx: CanvasRenderingContext2D, width: number, base: number, t: number, seed: number): void {
  for (let x = 0; x <= width + EDGE_STEP; x += EDGE_STEP) {
    const y = shoreEdgeY(x, base, t, seed);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}

function fillBand(ctx: CanvasRenderingContext2D, width: number, height: number, band: Band, fullness: number, t: number): void {
  const base = bandBaseY(height, band, fullness);
  ctx.beginPath();
  traceEdgePath(ctx, width, base, t, band.seed);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = band.color;
  ctx.fill();
}

function strokeEdge(ctx: CanvasRenderingContext2D, width: number, height: number, band: Band, fullness: number, t: number): void {
  const base = bandBaseY(height, band, fullness);
  ctx.beginPath();
  traceEdgePath(ctx, width, base, t, band.seed);
  ctx.strokeStyle = FOAM_THREAD_COLOR;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export interface ShoreSceneProps {
  fullness: number;
  style?: StyleProp<ViewStyle>;
}

export function ShoreScene({ fullness, style }: ShoreSceneProps) {
  const { width, height } = useWindowDimensions();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullnessRef = useRef(fullness);
  fullnessRef.current = fullness;
  const specksRef = useRef<SandSpeck[] | undefined>(undefined);
  const bubblesRef = useRef<BubbleSeed[] | undefined>(undefined);
  if (!specksRef.current) specksRef.current = makeSandSpecks(SAND_SPECK_COUNT);
  if (!bubblesRef.current) bubblesRef.current = makeBubbleSeeds(BUBBLE_COUNT);
  const wetBaseYRef = useRef(height * FOAM_BAND.low);
  const prevHeightRef = useRef(height);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const prevHeight = prevHeightRef.current;
    if (prevHeight !== height && prevHeight > 0) {
      wetBaseYRef.current = (wetBaseYRef.current / prevHeight) * height;
    }
    prevHeightRef.current = height;
  }, [height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    function draw(now: number) {
      if (!ctx) return;
      const dtS = lastTimeRef.current === null ? 0 : Math.max(0, now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, SAND_TOP);
      gradient.addColorStop(1, SAND_BOTTOM);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = SAND_SPECK_COLOR;
      for (const speck of specksRef.current!) {
        ctx.beginPath();
        ctx.arc(speck.xFrac * width, speck.yFrac * height, speck.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const foamY = bandBaseY(height, FOAM_BAND, fullnessRef.current);
      wetBaseYRef.current = nextWetBaseY(wetBaseYRef.current, foamY, dtS);
      ctx.beginPath();
      traceEdgePath(ctx, width, wetBaseYRef.current - 4, now, FOAM_BAND.seed);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = WET_SAND_COLOR;
      ctx.fill();

      for (const band of BANDS) fillBand(ctx, width, height, band, fullnessRef.current, now);
      for (const band of THREAD_BANDS) strokeEdge(ctx, width, height, band, fullnessRef.current, now);

      const paleBase = bandBaseY(height, PALE_BAND, fullnessRef.current);
      for (const bubble of bubblesRef.current!) {
        const cx = bubble.xFrac * width;
        const cy = shoreEdgeY(cx, paleBase, now, PALE_BAND.seed) + bubble.offset;
        const alpha = Math.max(0.12, 0.35 + 0.35 * Math.sin(now * 0.001 + bubble.seed));
        ctx.beginPath();
        ctx.arc(cx, cy, bubble.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return createElement(CANVAS, { ref: canvasRef, style: { ...StyleSheet.absoluteFill, ...(style as object) } });
}
