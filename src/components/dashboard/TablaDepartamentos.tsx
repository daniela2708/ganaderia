import { useMemo } from 'react';
import { AnimalData, FarmData } from '@/types/dashboard';

interface TablaDepartamentosProps {
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
}

interface DepartmentSummary {
  departamento: string;
  totalBovinos: number;
  participacion: number;
  totalFincas: number;
  avgAnimalesPorFinca: number;
}

export const TablaDepartamentos = ({ animalData, farmData, selectedYear }: TablaDepartamentosProps) => {
  console.log('=== TablaDepartamentos ===');
  console.log('animalData length:', animalData.length);
  console.log('farmData length:', farmData.length);
  console.log('selectedYear:', selectedYear);

  const departmentSummaryData = useMemo(() => {
    // Filtrar datos por año
    const animalDataFiltered = animalData.filter(d => d.AÑO === selectedYear);
    const farmDataFiltered = farmData.filter(d => d.AÑO === selectedYear);

    console.log('Datos filtrados - Animal:', animalDataFiltered.length, 'Farm:', farmDataFiltered.length);

    // Calcular totales por departamento de datos bovinos
    const bovinosPorDepartamento = animalDataFiltered.reduce((acc, item) => {
      const dept = item.DEPARTAMENTO;
      if (!dept) return acc;

      if (!acc[dept]) {
        acc[dept] = 0;
      }
      
      // Usar la columna 'TOTAL BOVINOS' del CSV
      acc[dept] += item['TOTAL BOVINOS'] || 0;

      return acc;
    }, {} as Record<string, number>);

    // Calcular total de fincas por departamento
    const fincasPorDepartamento = farmDataFiltered.reduce((acc, item) => {
      const dept = item.DEPARTAMENTO;
      if (!dept) return acc;

      if (!acc[dept]) {
        acc[dept] = 0;
      }
      
      acc[dept] += item['TOTAL FINCAS'] || 0;
      return acc;
    }, {} as Record<string, number>);

    console.log('Bovinos por departamento:', Object.keys(bovinosPorDepartamento).length);
    console.log('Fincas por departamento:', Object.keys(fincasPorDepartamento).length);

    // Calcular total nacional de bovinos
    const totalNacionalBovinos = Object.values(bovinosPorDepartamento).reduce((sum, val) => sum + val, 0);

    // Crear resumen por departamento
    const departmentSummary: DepartmentSummary[] = Object.keys(bovinosPorDepartamento)
      .map(dept => {
        const totalBovinos = bovinosPorDepartamento[dept] || 0;
        const totalFincas = fincasPorDepartamento[dept] || 0;
        const participacion = totalNacionalBovinos > 0 ? (totalBovinos / totalNacionalBovinos) * 100 : 0;
        const avgAnimalesPorFinca = totalFincas > 0 ? totalBovinos / totalFincas : 0;

        return {
          departamento: dept,
          totalBovinos,
          participacion,
          totalFincas,
          avgAnimalesPorFinca
        };
      })
      .filter(item => item.totalBovinos > 0) // Solo departamentos con bovinos
      .sort((a, b) => b.totalBovinos - a.totalBovinos); // Ordenar por total de bovinos descendente

    console.log('Resumen departamentos:', departmentSummary.length);
    console.log('Top 3 departamentos:', departmentSummary.slice(0, 3));

    return departmentSummary;
  }, [animalData, farmData, selectedYear]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-CO').format(Math.round(num));
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <h3 className="text-sm font-medium text-green-900 text-center">
          🗂️ Datos por Departamento - {selectedYear}
        </h3>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-medium text-gray-700">Departamento</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Total Bovinos</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">% Participación</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Total Fincas</th>
              <th className="text-right py-2 px-2 font-medium text-gray-700">Promedio/Finca</th>
            </tr>
          </thead>
          <tbody>
            {departmentSummaryData.length > 0 ? (
              departmentSummaryData.map((dept, index) => (
                <tr 
                  key={dept.departamento} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index < 3 ? 'bg-amber-25' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium text-gray-900">
                    {dept.departamento}
                    {index < 3 && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1 rounded">
                        #{index + 1}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-900">
                    {formatNumber(dept.totalBovinos)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {formatPercentage(dept.participacion)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {formatNumber(dept.totalFincas)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {formatNumber(dept.avgAnimalesPorFinca)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No hay datos disponibles para el año {selectedYear}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        {departmentSummaryData.length > 0 && (
          <>
            Total departamentos: {departmentSummaryData.length} | 
            Total bovinos nacional: {formatNumber(departmentSummaryData.reduce((sum, dept) => sum + dept.totalBovinos, 0))} | 
            Total fincas nacional: {formatNumber(departmentSummaryData.reduce((sum, dept) => sum + dept.totalFincas, 0))}
          </>
        )}
      </div>
    </div>
  );
};