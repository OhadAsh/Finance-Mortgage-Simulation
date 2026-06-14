import { useEffect, useRef, useState } from 'react';
import { formatPercent } from '../../lib/format';

interface LtvGaugeProps {
  value: number;
}

function getColor(ltv: number): string {
  if (ltv < 60) return '#10B981';
  if (ltv < 80) return '#F59E0B';
  return '#EF4444';
}

function getLabel(ltv: number): string {
  if (ltv < 60) return 'מצוין';
  if (ltv < 80) return 'סביר';
  return 'גבוה';
}

const RADIUS = 80;
const STROKE_WIDTH = 12;
const CENTER = 100;
const START_ANGLE = 135;
const END_ANGLE = 405;
const TOTAL_ANGLE = END_ANGLE - START_ANGLE;
const ARC_LENGTH = 2 * Math.PI * RADIUS * (TOTAL_ANGLE / 360);

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function pointAt(angle: number): { x: number; y: number } {
  return {
    x: CENTER + RADIUS * Math.cos(toRad(angle)),
    y: CENTER + RADIUS * Math.sin(toRad(angle)),
  };
}

const arcStart = pointAt(START_ANGLE);
const arcEnd = pointAt(END_ANGLE);
const ARC_PATH = `M ${arcStart.x} ${arcStart.y} A ${RADIUS} ${RADIUS} 0 1 1 ${arcEnd.x} ${arcEnd.y}`;

export function LtvGauge({ value }: LtvGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const [animatedValue, setAnimatedValue] = useState(clampedValue);
  const currentRef = useRef(clampedValue);

  useEffect(() => {
    const from = currentRef.current;
    const to = clampedValue;
    if (Math.abs(from - to) < 0.01) return;

    const duration = 800;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = from + (to - from) * eased;
      currentRef.current = next;
      setAnimatedValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clampedValue]);

  const color = getColor(animatedValue);
  const dashOffset = ARC_LENGTH * (1 - animatedValue / 100);

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-700 bg-card p-4">
      <h3 className="mb-2 text-sm font-medium text-slate-300">יחס הלוואה לשווי (LTV)</h3>
      <svg width="200" height="160" viewBox="0 0 200 160">
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#334155"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        {animatedValue > 0.5 && (
          <path
            d={ARC_PATH}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={dashOffset}
          />
        )}
        <text
          x={CENTER}
          y={CENTER + 10}
          textAnchor="middle"
          className="fill-white text-2xl font-bold"
          style={{ fontFamily: 'Inter, monospace', fontSize: '28px' }}
        >
          {formatPercent(animatedValue, 0)}
        </text>
        <text
          x={CENTER}
          y={CENTER + 30}
          textAnchor="middle"
          fill={color}
          style={{ fontSize: '14px' }}
        >
          {getLabel(animatedValue)}
        </text>
      </svg>
    </div>
  );
}
