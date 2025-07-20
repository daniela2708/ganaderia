import { Calendar } from 'lucide-react';

interface YearFilterSectionProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

export const YearFilterSection = ({ 
  selectedYear, 
  onYearChange, 
  availableYears 
}: YearFilterSectionProps) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-amber-900 font-medium text-sm">Año de Análisis:</label>
          <select 
            className="bg-white border border-amber-300 rounded-md px-3 py-2 text-amber-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <Calendar className="h-6 w-6 text-amber-600" />
      </div>
    </div>
  );
};