export const CHART_GRID_STROKE = '#334155';
export const CHART_AXIS_TICK = { fill: '#94a3b8', fontSize: 10 };
export const CHART_MARGIN = { top: 32, right: 12, left: 4, bottom: 4 };
export const CHART_X_AXIS_HEIGHT = 54;

export function getChartXAxisInterval(dataLength: number): number | 'preserveStartEnd' {
  if (dataLength <= 14) return 1;
  if (dataLength <= 24) return 2;
  return 'preserveStartEnd';
}
