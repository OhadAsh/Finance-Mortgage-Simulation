import { useEffect, useRef, useState } from 'react';
import { CHART_ANIMATION_MS, LTV_GOOD_MAX, LTV_WARN_MAX } from '../../lib/constants';
import { formatPercent } from '../../lib/utils';

interface LtvBadgeProps {
  value: number;
}

function getColor(ltv: number): string {
  if (ltv < LTV_GOOD_MAX) return '#10B981';
  if (ltv < LTV_WARN_MAX) return '#F59E0B';
  return '#EF4444';
}

function getLabel(ltv: number): string {
  if (ltv < LTV_GOOD_MAX) return 'מצוין';
  if (ltv < LTV_WARN_MAX) return 'סביר';
  return 'גבוה';
}

function getVariantClasses(ltv: number): string {
  if (ltv < LTV_GOOD_MAX) return 'border-accent/40 bg-accent/10';
  if (ltv < LTV_WARN_MAX) return 'border-amber/40 bg-amber/10';
  return 'border-danger/40 bg-danger/10';
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

function useAnimatedLtv(value: number): number {
  const clampedValue = Math.min(100, Math.max(0, value));
  const [animatedValue, setAnimatedValue] = useState(clampedValue);
  const currentRef = useRef(clampedValue);

  useEffect(() => {
    const from = currentRef.current;
    const to = clampedValue;
    if (Math.abs(from - to) < 0.01) return;

    const duration = CHART_ANIMATION_MS;
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

  return animatedValue;
}

export function LtvBadge({ value }: LtvBadgeProps) {
  const animatedValue = useAnimatedLtv(value);
  const color = getColor(animatedValue);
  const label = getLabel(animatedValue);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2 sm:px-4 ${getVariantClasses(animatedValue)}`}
    >
      <svg width="52" height="40" viewBox="0 0 200 160" className="shrink-0" aria-hidden>
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
            strokeDashoffset={ARC_LENGTH * (1 - animatedValue / 100)}
          />
        )}
      </svg>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">יחס הלוואה לשווי בכניסה</p>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-bold text-white">
            {formatPercent(animatedValue, 0)}
          </span>
          <span className="text-sm font-medium" style={{ color }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
