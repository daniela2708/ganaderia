import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AnimalData, FarmData } from '@/types/dashboard';
import { MapPin, TrendingUp, Activity, Building2 } from 'lucide-react';

interface RankingDepartamentosProps {
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
}

export const RankingDepartamentos = ({ animalData, farmData, selectedYear }: RankingDepartamentosProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    departamento: string;
    totalBovinos: number;
    totalFincas: number;
    promedioFinca: number;
    x: number;
    y: number;
  }>({
    show: false,
    departamento: '',
    totalBovinos: 0,
    totalFincas: 0,
    promedioFinca: 0,
    x: 0,
    y: 0
  });

  // Función para normalizar nombres de departamentos
  const normalizarNombreDepartamento = (nombre: string | null | undefined): string => {
    if (!nombre || typeof nombre !== 'string') {
      return 'Sin Departamento';
    }
    
    // Convertir a formato título
    return nombre.toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  // Función para formatear números
  const formatearNumero = (num: number): string => {
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0
    }).format(num);
  };

  useEffect(() => {
    if (!svgRef.current || !animalData || animalData.length === 0 || !farmData) {
      console.log("RankingDepartamentos: No se puede renderizar - faltan datos");
      return;
    }

    console.log("RankingDepartamentos: Iniciando renderizado para año", selectedYear);

    // Limpiar contenido previo
    d3.select(svgRef.current).selectAll("*").remove();

    // Filtrar por año
    const yearAnimalData = animalData.filter(item => item.AÑO === selectedYear);
    const yearFarmData = farmData.filter(item => item.AÑO === selectedYear);
    console.log(`RankingDepartamentos: Datos filtrados para ${selectedYear}:`, yearAnimalData.length, yearFarmData.length);
    
    if (yearAnimalData.length === 0) {
      console.log("RankingDepartamentos: No hay datos para el año seleccionado");
      return;
    }
    
    // Calcular totales por departamento
    const departmentTotals = new Map<string, { bovinos: number; fincas: number }>();
    
    // Procesar datos bovinos
    yearAnimalData.forEach(item => {
      const departamento = normalizarNombreDepartamento(item.DEPARTAMENTO);
      const totalBovinos = item['TOTAL BOVINOS'] || 0;
      
      if (departamento && totalBovinos > 0) {
        const current = departmentTotals.get(departamento) || { bovinos: 0, fincas: 0 };
        departmentTotals.set(departamento, { ...current, bovinos: current.bovinos + totalBovinos });
      }
    });

    // Procesar datos de fincas
    yearFarmData.forEach(item => {
      const departamento = normalizarNombreDepartamento(item.DEPARTAMENTO);
      const totalFincas = item['TOTAL FINCAS'] || 0;
      
      if (departamento && totalFincas > 0) {
        const current = departmentTotals.get(departamento) || { bovinos: 0, fincas: 0 };
        departmentTotals.set(departamento, { ...current, fincas: current.fincas + totalFincas });
      }
    });

    // Convertir a array y ordenar por total bovinos (descendente)
    const sortedDepartments = Array.from(departmentTotals.entries())
      .map(([departamento, data]) => ({ 
        departamento, 
        totalBovinos: data.bovinos,
        totalFincas: data.fincas,
        promedioFinca: data.fincas > 0 ? data.bovinos / data.fincas : 0
      }))
      .filter(d => d.totalBovinos > 0)
      .sort((a, b) => b.totalBovinos - a.totalBovinos)
      .slice(0, 15); // Mostrar solo top 15 para mejor visualización

    console.log("RankingDepartamentos: Top departamentos:", sortedDepartments.slice(0, 5));

    if (sortedDepartments.length === 0) {
      console.log("RankingDepartamentos: No hay departamentos para mostrar");
      return;
    }

    const margin = { top: 20, right: 20, bottom: 20, left: 160 };
    const width = 500 - margin.left - margin.right;
    const height = Math.max(600, sortedDepartments.length * 30) - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const maxValue = d3.max(sortedDepartments, d => d.totalBovinos) || 0;
    console.log("RankingDepartamentos: Valor máximo:", maxValue);

    const xScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(sortedDepartments.map(d => d.departamento))
      .range([0, height])
      .padding(0.15);

    // Crear gradiente para las barras
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "barGradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#22c55e");

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#16a34a");

    // Barras
    const bars = g.selectAll(".barra")
      .data(sortedDepartments)
      .enter()
      .append("rect")
      .attr("class", "barra")
      .attr("x", 0)
      .attr("y", d => yScale(d.departamento) || 0)
      .attr("width", 0) // Iniciar con ancho 0 para animación
      .attr("height", yScale.bandwidth())
      .attr("fill", "url(#barGradient)")
      .attr("rx", 3)
      .style("cursor", "pointer")
      .style("transition", "fill 0.3s ease");

    // Animación de entrada
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("width", d => xScale(d.totalBovinos));

    // Event handlers
    bars.on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "#15803d"); // Verde más oscuro en hover
        
        // Obtener posición del mouse relativa a la página
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = event.clientX - (containerRect?.left || 0);
        const y = event.clientY - (containerRect?.top || 0);
        
        setTooltip({
          show: true,
          departamento: d.departamento,
          totalBovinos: d.totalBovinos,
          totalFincas: d.totalFincas,
          promedioFinca: d.promedioFinca,
          x: x + 10,
          y: y - 10
        });
      })
      .on("mousemove", function(event) {
        // Actualizar posición del tooltip
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = event.clientX - (containerRect?.left || 0);
        const y = event.clientY - (containerRect?.top || 0);
        
        setTooltip(prev => ({
          ...prev,
          x: x + 10,
          y: y - 10
        }));
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "url(#barGradient)");
        setTooltip(prev => ({ ...prev, show: false }));
      });

    // Etiquetas de departamentos
    const labels = g.selectAll(".departamento-label")
      .data(sortedDepartments)
      .enter()
      .append("text")
      .attr("class", "departamento-label")
      .attr("x", -10)
      .attr("y", d => (yScale(d.departamento) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#374151") // Gris oscuro
      .style("text-anchor", "end")
      .style("cursor", "pointer")
      .text(d => d.departamento)
      .style("opacity", 0);

    // Animación de entrada para labels
    labels.transition()
      .duration(800)
      .delay((d, i) => i * 50 + 400)
      .style("opacity", 1);

    // Event handlers para labels
    labels.on("mouseover", function(event, d) {
        d3.select(this).style("fill", "#059669"); // Verde en hover
        
        // Obtener posición del mouse relativa a la página
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = event.clientX - (containerRect?.left || 0);
        const y = event.clientY - (containerRect?.top || 0);
        
        setTooltip({
          show: true,
          departamento: d.departamento,
          totalBovinos: d.totalBovinos,
          totalFincas: d.totalFincas,
          promedioFinca: d.promedioFinca,
          x: x + 10,
          y: y - 10
        });
      })
      .on("mousemove", function(event) {
        // Actualizar posición del tooltip
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = event.clientX - (containerRect?.left || 0);
        const y = event.clientY - (containerRect?.top || 0);
        
        setTooltip(prev => ({
          ...prev,
          x: x + 10,
          y: y - 10
        }));
      })
      .on("mouseout", function() {
        d3.select(this).style("fill", "#374151");
        setTooltip(prev => ({ ...prev, show: false }));
      });


    console.log("RankingDepartamentos: Renderizado completado");

  }, [animalData, farmData, selectedYear]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="max-h-96 overflow-y-auto">
        <svg ref={svgRef} className="w-full" />
      </div>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="absolute z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-600 rounded-full p-1.5">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">
                {tooltip.departamento}
              </h4>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-amber-700 rounded-full p-1.5">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium">Total Bovinos</p>
                <p className="text-lg font-bold text-amber-900">
                  {tooltip.totalBovinos.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-800 rounded-full p-1.5">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium">Total Fincas</p>
                <p className="text-sm font-bold text-amber-900">
                  {tooltip.totalFincas.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-900 rounded-full p-1.5">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium">Promedio por Finca</p>
                <p className="text-sm font-bold text-amber-900">
                  {tooltip.promedioFinca.toLocaleString('es-CO', { maximumFractionDigits: 1 })} bovinos
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-amber-200">
            <div className="bg-gray-600 rounded-full p-1">
              <MapPin className="h-3 w-3 text-white" />
            </div>
            <p className="text-xs text-amber-700">
              Año {selectedYear}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};