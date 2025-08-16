import { AnimalData, FarmData } from '@/types/dashboard';
import { KPICards } from './KPICards';
import { useI18n } from '@/lib/i18n';

interface MetricsSectionProps {
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
}

export const MetricsSection = ({ animalData, farmData, selectedYear }: MetricsSectionProps) => {
  const { t } = useI18n();
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-100">
      <h3 className="text-lg font-semibold text-amber-950 mb-4 text-left">
        {t('metrics.general')}
      </h3>
      <KPICards
        animalData={animalData}
        farmData={farmData}
        selectedYear={selectedYear}
      />
    </div>
  );
};