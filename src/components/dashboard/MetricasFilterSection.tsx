import { Calendar, MapPin, Building } from 'lucide-react';
import { AnimalData } from '@/types/dashboard';
import { SearchSelect } from '@/components/ui/search-select';

interface MetricasFilterSectionProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
  selectedDepartamento: string;
  onDepartamentoChange: (departamento: string) => void;
  selectedMunicipio: string;
  onMunicipioChange: (municipio: string) => void;
  animalData: AnimalData[];
}

export const MetricasFilterSection = ({ 
  selectedYear, 
  onYearChange, 
  availableYears,
  selectedDepartamento,
  onDepartamentoChange,
  selectedMunicipio,
  onMunicipioChange,
  animalData
}: MetricasFilterSectionProps) => {
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
  
  // Obtener municipios del departamento seleccionado
  const municipiosDelDepartamento = selectedDepartamento 
    ? Array.from(new Set(
        animalData
          .filter(d => d.DEPARTAMENTO === selectedDepartamento)
          .map(d => d.MUNICIPIO)
      )).sort()
    : [];
    
  // Convertir municipios a formato para SearchSelect
  const municipioOptions = [
    { value: '', label: selectedDepartamento ? 'Todos los Municipios' : 'Seleccione un Departamento' },
    ...municipiosDelDepartamento.map(municipio => ({
      value: municipio,
      label: municipio.charAt(0).toUpperCase() + municipio.slice(1).toLowerCase()
    }))
  ];

  // Resetear municipio cuando cambia el departamento
  const handleDepartamentoChange = (departamento: string) => {
    onDepartamentoChange(departamento);
    onMunicipioChange(''); // Resetear municipio
  };

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
              onChange={handleDepartamentoChange}
              options={departamentoOptions}
              placeholder="Todos los Departamentos"
            />
          </div>

          {/* Filtro de Municipio */}
          <div className="flex items-center gap-3">
            <label className="text-amber-900 font-medium text-sm">Municipio:</label>
            <SearchSelect
              value={selectedMunicipio}
              onChange={onMunicipioChange}
              options={municipioOptions}
              placeholder={selectedDepartamento ? "Todos los Municipios" : "Seleccione un Departamento"}
              disabled={!selectedDepartamento}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-amber-600" />
          <MapPin className="h-6 w-6 text-amber-600" />
          <Building className="h-6 w-6 text-amber-600" />
        </div>
      </div>
    </div>
  );
}; 