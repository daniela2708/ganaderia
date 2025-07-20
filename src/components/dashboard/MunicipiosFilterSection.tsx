import { Calendar, MapPin } from 'lucide-react';
import { AnimalData } from '@/types/dashboard';
import { SearchSelect } from '@/components/ui/search-select';

interface MunicipiosFilterSectionProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
  selectedDepartamento: string;
  onDepartamentoChange: (departamento: string) => void;
  animalData: AnimalData[];
}

export const MunicipiosFilterSection = ({ 
  selectedYear, 
  onYearChange, 
  availableYears,
  selectedDepartamento,
  onDepartamentoChange,
  animalData
}: MunicipiosFilterSectionProps) => {
  // Obtener departamentos únicos de los datos
  const departamentos = Array.from(new Set(animalData.map(d => d.DEPARTAMENTO))).sort();
  
  // Convertir a formato para SearchSelect
  const departamentoOptions = [
    { value: '', label: 'Todos los Departamentos' },
    ...departamentos.map(departamento => ({
      value: departamento,
      label: departamento.charAt(0).toUpperCase() + departamento.slice(1).toLowerCase()
    }))
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Filtro de Año */}
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

          {/* Filtro de Departamento */}
          <div className="flex items-center gap-3">
            <label className="text-amber-900 font-medium text-sm">Departamento:</label>
            <SearchSelect
              value={selectedDepartamento}
              onChange={onDepartamentoChange}
              options={departamentoOptions}
              placeholder="Todos los Departamentos"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-amber-600" />
          <MapPin className="h-6 w-6 text-amber-600" />
        </div>
      </div>
    </div>
  );
}; 