import { useMemo } from 'react';
import { AnimalData, FarmData } from '@/types/dashboard';

interface TablaMunicipiosProps {
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
  selectedDepartamento: string;
}

interface MunicipalitySummary {
  municipio: string;
  departamento: string;
  totalBovinos: number;
  participacion: number;
  totalFincas: number;
  avgAnimalesPorFinca: number;
}

export const TablaMunicipios = ({ animalData, farmData, selectedYear, selectedDepartamento }: TablaMunicipiosProps) => {
  console.log('=== TablaMunicipios ===');
  console.log('animalData length:', animalData.length);
  console.log('farmData length:', farmData.length);
  console.log('selectedYear:', selectedYear);
  console.log('selectedDepartamento:', selectedDepartamento);

  const municipalitySummaryData = useMemo(() => {
    // Filtrar datos por año
    let animalDataFiltered = animalData.filter(d => d.AÑO === selectedYear);
    let farmDataFiltered = farmData.filter(d => d.AÑO === selectedYear);

    // Filtrar por departamento si está seleccionado
    if (selectedDepartamento) {
      animalDataFiltered = animalDataFiltered.filter(d => d.DEPARTAMENTO === selectedDepartamento);
      farmDataFiltered = farmDataFiltered.filter(d => d.DEPARTAMENTO === selectedDepartamento);
    }

    console.log('Datos filtrados - Animal:', animalDataFiltered.length, 'Farm:', farmDataFiltered.length);

    // Calcular totales por municipio de datos bovinos
    const bovinosPorMunicipio = animalDataFiltered.reduce((acc, item) => {
      const municipio = item.MUNICIPIO;
      const departamento = item.DEPARTAMENTO;
      if (!municipio || !departamento) return acc;

      const key = `${departamento}|${municipio}`;
      
      if (!acc[key]) {
        acc[key] = { municipio, departamento, total: 0 };
      }
      
      // Usar la columna 'TOTAL BOVINOS' del CSV
      acc[key].total += item['TOTAL BOVINOS'] || 0;

      return acc;
    }, {} as Record<string, { municipio: string; departamento: string; total: number }>);

    // Calcular total de fincas por municipio
    const fincasPorMunicipio = farmDataFiltered.reduce((acc, item) => {
      const municipio = item.MUNICIPIO;
      const departamento = item.DEPARTAMENTO;
      if (!municipio || !departamento) return acc;

      const key = `${departamento}|${municipio}`;
      
      if (!acc[key]) {
        acc[key] = 0;
      }
      
      acc[key] += item['TOTAL FINCAS'] || 0;
      return acc;
    }, {} as Record<string, number>);

    console.log('Bovinos por municipio:', Object.keys(bovinosPorMunicipio).length);
    console.log('Fincas por municipio:', Object.keys(fincasPorMunicipio).length);

    // Calcular total de bovinos para participación
    const totalBovinos = Object.values(bovinosPorMunicipio).reduce((sum, val) => sum + val.total, 0);

    // Crear resumen por municipio
    const municipalitySummary: MunicipalitySummary[] = Object.keys(bovinosPorMunicipio)
      .map(key => {
        const bovinoData = bovinosPorMunicipio[key];
        const totalBovinos = bovinoData.total;
        const totalFincas = fincasPorMunicipio[key] || 0;
        const participacion = totalBovinos > 0 ? (totalBovinos / (totalBovinos || 1)) * 100 : 0;
        const avgAnimalesPorFinca = totalFincas > 0 ? totalBovinos / totalFincas : 0;

        return {
          municipio: bovinoData.municipio,
          departamento: bovinoData.departamento,
          totalBovinos,
          participacion: totalBovinos > 0 ? (totalBovinos / Object.values(bovinosPorMunicipio).reduce((sum, val) => sum + val.total, 0)) * 100 : 0,
          totalFincas,
          avgAnimalesPorFinca
        };
      })
      .filter(item => item.totalBovinos > 0) // Solo municipios con bovinos
      .sort((a, b) => b.totalBovinos - a.totalBovinos); // Ordenar por total de bovinos descendente

    console.log('Resumen municipios:', municipalitySummary.length);
    console.log('Top 3 municipios:', municipalitySummary.slice(0, 3));

    return municipalitySummary;
  }, [animalData, farmData, selectedYear, selectedDepartamento]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-CO').format(Math.round(num));
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <h3 className="text-sm font-medium text-blue-900 text-center">
          🏛️ Datos por Municipio - {selectedYear}
          {selectedDepartamento && (
            <span className="block text-xs text-blue-700 mt-1">
              Departamento: {selectedDepartamento}
            </span>
          )}
        </h3>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-medium text-gray-700">Municipio</th>
              {!selectedDepartamento && (
                <th className="text-left py-2 px-2 font-medium text-gray-700">Departamento</th>
              )}
              <th className="text-right py-2 px-2 font-medium text-gray-700">Total Bovinos</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">% Participación</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Total Fincas</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Promedio/Finca</th>
            </tr>
          </thead>
          <tbody>
            {municipalitySummaryData.length > 0 ? (
              municipalitySummaryData.map((mun, index) => (
                <tr 
                  key={`${mun.departamento}-${mun.municipio}`} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index < 3 ? 'bg-blue-25' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium text-gray-900">
                    {mun.municipio}
                    {index < 3 && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        #{index + 1}
                      </span>
                    )}
                  </td>
                  {!selectedDepartamento && (
                    <td className="py-2 px-2 text-gray-600 text-xs">
                      {mun.departamento}
                    </td>
                  )}
                  <td className="py-2 px-2 text-right text-gray-900">
                    {formatNumber(mun.totalBovinos)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {formatPercentage(mun.participacion)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {formatNumber(mun.totalFincas)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {formatNumber(mun.avgAnimalesPorFinca)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedDepartamento ? 5 : 6} className="py-8 text-center text-gray-500">
                  No hay datos disponibles para el año {selectedYear}
                  {selectedDepartamento && ` en ${selectedDepartamento}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        {municipalitySummaryData.length > 0 && (
          <>
            Total municipios: {municipalitySummaryData.length} | 
            Total bovinos: {formatNumber(municipalitySummaryData.reduce((sum, mun) => sum + mun.totalBovinos, 0))} | 
            Total fincas: {formatNumber(municipalitySummaryData.reduce((sum, mun) => sum + mun.totalFincas, 0))}
          </>
        )}
      </div>
    </div>
  );
};