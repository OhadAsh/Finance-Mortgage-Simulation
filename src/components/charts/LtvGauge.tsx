import { useEffect, useState } from 'react';
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

export function LtvGauge({ value }: LtvGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const clampedValue = Math.min(100, Math.max(0, value));
  const color = getColor(clampedValue);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(clampedValue), 100);
    return () => clearTimeout(timeout);
  }, [clampedValue]);

  const radius = 80;
  const strokeWidth = 12;
  const center = 100;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const valueAngle = startAngle + (animatedValue / 100) * totalAngle;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcStart = {
    x: center + radius * Math.cos(toRad(startAngle)),
    y: center + radius * Math.sin(toRad(startAngle)),
  };
  const arcEnd = {
    x: center + radius * Math.cos(toRad(valueAngle)),
    y: center + radius * Math.sin(toRad(valueAngle)),
  };
  const largeArc = animatedValue > 50 ? 1 : 0;

  const bgEnd = {
    x: center + radius * Math.cos(toRad(endAngle)),
    y: center + radius * Math.sin(toRad(endAngle)),
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-700 bg-card p-4">
      <h3 className="mb-2 text-sm font-medium text-slate-300">יחס הלוואה לשווי (LTV)</h3>
      <svg width="200" height="160" viewBox="0 0 200 160">
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 1 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="#334155"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {animatedValue > 0 && (
          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ transition: 'all 0.8s ease-out' }}
          />
        )}
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          className="fill-white text-2xl font-bold"
          style={{ fontFamily: 'Inter, monospace', fontSize: '28px' }}
        >
          {formatPercent(animatedValue, 0)}
        </text>
        <text
          x={center}
          y={center + 30}
          textAnchor="middle"
          fill={color}
          style={{ fontSize: '14px' }}
        >
          {getLabel(clampedValue)}
        </text>
      </svg>
    </div>
  );
}
