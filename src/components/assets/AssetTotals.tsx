import { Wallet, Droplets, Lock } from 'lucide-react';
import { useAssetsStore } from '../../store/useAssetsStore';
import { totalGross, totalNet, totalLiquidNet } from '../../lib/calculations';
import { formatCurrency } from '../../lib/utils';
import { MetricCard } from '../ui/MetricCard';

export function AssetTotals() {
  const assets = useAssetsStore((s) => s.assets);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MetricCard
        title="סה״כ ברוטו"
        value={formatCurrency(totalGross(assets))}
        icon={<Wallet className="h-4 w-4" />}
      />
      <MetricCard
        title="סה״כ נטו"
        value={formatCurrency(totalNet(assets))}
        variant="accent"
        icon={<Droplets className="h-4 w-4" />}
      />
      <MetricCard
        title="נזיל בלבד"
        value={formatCurrency(totalLiquidNet(assets))}
        variant="amber"
        icon={<Lock className="h-4 w-4" />}
        subtitle="כולל חצי-נזיל × 70%"
      />
    </div>
  );
}
