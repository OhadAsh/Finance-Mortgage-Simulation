interface LegendItem {
  value?: string;
  color?: string;
}

interface ChartLegendProps {
  payload?: LegendItem[];
}

export function ChartLegend({ payload }: ChartLegendProps) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-700/80 pt-3">
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className="h-0.5 w-5 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
