import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { BANDS, bandBaseY, shoreEdgeY, type Band } from '@/lib/shore-scene';

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

function drawBand(ctx: CanvasRenderingContext2D, width: number, height: number, band: Band, fullness: number, t: number): void {
  const base = bandBaseY(height, band, fullness);
  ctx.beginPath();
  for (let x = 0; x <= width; x += 8) {
    const y = shoreEdgeY(x, base, t, band.seed);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = band.color;
  ctx.fill();
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
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, SAND_TOP);
      gradient.addColorStop(1, SAND_BOTTOM);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const band of BANDS) drawBand(ctx, width, height, band, fullnessRef.current, now);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return createElement(CANVAS, { ref: canvasRef, style: { ...StyleSheet.absoluteFill, ...(style as object) } });
}
