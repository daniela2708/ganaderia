import { X, Calendar, MapPin, Building } from 'lucide-react';

interface ActiveFiltersTagsProps {
  selectedYear: number;
  selectedDepartamento: string;
  selectedMunicipio: string;
  onClearDepartamento: () => void;
  onClearMunicipio: () => void;
}

export const ActiveFiltersTags = ({
  selectedYear,
  selectedDepartamento,
  selectedMunicipio,
  onClearDepartamento,
  onClearMunicipio
}: ActiveFiltersTagsProps) => {
  const hasActiveFilters = selectedDepartamento || selectedMunicipio;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-amber-25 border border-amber-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-amber-600 rounded-full p-1">
          <Calendar className="h-3 w-3 text-white" />
        </div>
        <span className="text-xs font-medium text-amber-800">Filtros Activos:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Tag del año (siempre visible) */}
        <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 rounded-full px-3 py-1.5">
          <Calendar className="h-3 w-3 text-amber-700" />
          <span className="text-xs font-medium text-amber-800">
            Año {selectedYear}
          </span>
        </div>

        {/* Tag del departamento */}
        {selectedDepartamento && (
          <div className="flex items-center gap-1.5 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5">
            <MapPin className="h-3 w-3 text-blue-700" />
            <span className="text-xs font-medium text-blue-800">
              {selectedDepartamento}
            </span>
            <button
              onClick={onClearDepartamento}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              title="Limpiar departamento"
            >
              <X className="h-3 w-3 text-blue-600" />
            </button>
          </div>
        )}

        {/* Tag del municipio */}
        {selectedMunicipio && (
          <div className="flex items-center gap-1.5 bg-green-100 border border-green-300 rounded-full px-3 py-1.5">
            <Building className="h-3 w-3 text-green-700" />
            <span className="text-xs font-medium text-green-800">
              {selectedMunicipio}
            </span>
            <button
              onClick={onClearMunicipio}
              className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
              title="Limpiar municipio"
            >
              <X className="h-3 w-3 text-green-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 