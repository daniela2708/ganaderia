import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnimalData, FarmData } from '@/types/dashboard';
import { Activity, MapPin, TrendingUp, Building2 } from 'lucide-react';

interface RankingMunicipiosProps {
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
}

interface MunicipioData {
  municipio: string;
  departamento: string;
  totalBovinos: number;
  totalFincas: number;
  promedioFinca: number;
}

interface TooltipState {
  show: boolean;
  municipio: string;
  departamento: string;
  totalBovinos: number;
  totalFincas: number;
  promedioFinca: number;
  x: number;
  y: number;
}

export const RankingMunicipios = ({ animalData, farmData, selectedYear }: RankingMunicipiosProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<TooltipState>({ 
    show: false, 
    municipio: '', 
    departamento: '', 
    totalBovinos: 0, 
    totalFincas: 0, 
    promedioFinca: 0, 
    x: 0, 
    y: 0 
  });

  useEffect(() => {
    if (!svgRef.current || animalData.length === 0 || !farmData) return;

    // Limpiar SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Filtrar datos por año seleccionado
    const animalDataFiltrados = animalData.filter(d => d.AÑO === selectedYear);
    const farmDataFiltrados = farmData.filter(d => d.AÑO === selectedYear);
    
    if (animalDataFiltrados.length === 0) return;

    // Agrupar por municipio
    const municipiosMap = new Map<string, { totalBovinos: number; totalFincas: number; departamento: string }>();
    
    // Procesar datos de bovinos
    animalDataFiltrados.forEach(d => {
      const municipio = d.MUNICIPIO;
      const departamento = d.DEPARTAMENTO;
      const bovinos = d['TOTAL BOVINOS'] || 0;
      
      if (municipio && bovinos > 0) {
        const key = `${departamento}|${municipio}`;
        if (municipiosMap.has(key)) {
          const existing = municipiosMap.get(key)!;
          existing.totalBovinos += bovinos;
        } else {
          municipiosMap.set(key, { totalBovinos: bovinos, totalFincas: 0, departamento });
        }
      }
    });

    // Procesar datos de fincas
    farmDataFiltrados.forEach(d => {
      const municipio = d.MUNICIPIO;
      const departamento = d.DEPARTAMENTO;
      const fincas = d['TOTAL FINCAS'] || 0;
      
      if (municipio && fincas > 0) {
        const key = `${departamento}|${municipio}`;
        if (municipiosMap.has(key)) {
          const existing = municipiosMap.get(key)!;
          existing.totalFincas += fincas;
        } else {
          municipiosMap.set(key, { totalBovinos: 0, totalFincas: fincas, departamento });
        }
      }
    });

    // Convertir a array y ordenar por total de bovinos
    const municipiosData: MunicipioData[] = Array.from(municipiosMap.entries())
      .map(([key, data]) => {
        const parts = key.split('|');
        const municipio = parts.length > 1 ? parts[1] : parts[0];
        return { 
          municipio, 
          departamento: data.departamento,
          totalBovinos: data.totalBovinos,
          totalFincas: data.totalFincas,
          promedioFinca: data.totalFincas > 0 ? data.totalBovinos / data.totalFincas : 0
        };
      })
      .filter(d => d.totalBovinos > 0)
      .sort((a, b) => b.totalBovinos - a.totalBovinos)
      .slice(0, 50); // Top 50 municipios

    if (municipiosData.length === 0) return;

    // Configuración del gráfico
    const margin = { top: 20, right: 30, bottom: 20, left: 180 };
    const width = 600 - margin.left - margin.right;
    const height = Math.max(400, municipiosData.length * 30) - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3.scaleLinear()
      .domain([0, d3.max(municipiosData, d => d.totalBovinos) || 0])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(municipiosData.map(d => d.municipio))
      .range([0, height])
      .padding(0.15);

    // Crear gradiente para las barras
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "barGradientMunicipios")
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#22c55e");

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#16a34a");

    // Agregar barras
    const bars = svg.selectAll(".bar")
      .data(municipiosData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.municipio) || 0)
      .attr("width", 0) // Iniciar con ancho 0 para animación
      .attr("height", y.bandwidth())
      .attr("fill", "url(#barGradientMunicipios)")
      .attr("rx", 3)
      .style("cursor", "pointer")
      .style("transition", "fill 0.3s ease");

    // Animación de entrada
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 30)
      .attr("width", d => x(d.totalBovinos));

    // Event handlers
    bars.on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "#15803d"); // Verde más oscuro en hover
        
        // Obtener posición del mouse relativa a la página
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = event.clientX - (containerRect?.left || 0);
        const y = event.clientY - (containerRect?.top || 0);
        
        setTooltip({
          show: true,
          municipio: d.municipio,
          departamento: d.departamento,
          totalBovinos: d.totalBovinos,
          totalFincas: d.totalFincas,
          promedioFinca: d.promedioFinca,
          x: x + 10,
          y: y - 10
        });
      })
      .on("mousemove", function(event, d) {
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
        d3.select(this).attr("fill", "url(#barGradientMunicipios)");
        setTooltip(prev => ({ ...prev, show: false }));
      });

    // Agregar etiquetas de municipios con soporte para múltiples líneas
    municipiosData.forEach((d, i) => {
      const municipio = d.municipio.charAt(0).toUpperCase() + d.municipio.slice(1).toLowerCase();
      const words = municipio.split(' ');
      const yPos = (y(d.municipio) || 0) + y.bandwidth() / 2;
      
      if (words.length > 2 || municipio.length > 20) {
        // Si tiene más de 2 palabras o es muy largo, dividir en dos líneas
        let line1, line2;
        
        if (words.length > 2) {
          // Dividir por palabras
          const midPoint = Math.ceil(words.length / 2);
          line1 = words.slice(0, midPoint).join(' ');
          line2 = words.slice(midPoint).join(' ');
        } else {
          // Dividir por longitud
          const midPoint = Math.ceil(municipio.length / 2);
          const lastSpace = municipio.lastIndexOf(' ', midPoint);
          const splitPoint = lastSpace > 0 ? lastSpace : midPoint;
          line1 = municipio.substring(0, splitPoint);
          line2 = municipio.substring(splitPoint + 1);
        }
        
        // Primera línea
        const label1 = svg.append("text")
          .attr("class", "municipio-label")
          .attr("x", -10)
          .attr("y", yPos - 6)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
          .attr("fill", "#451a03")
          .style("cursor", "pointer")
          .style("opacity", 0)
          .text(line1)
          .on("mouseover", function(event) {
            d3.select(this).attr("fill", "#92400e");
            
            const containerRect = containerRef.current?.getBoundingClientRect();
            const x = event.clientX - (containerRect?.left || 0);
            const y = event.clientY - (containerRect?.top || 0);
            
            setTooltip({
              show: true,
              municipio: d.municipio,
              departamento: d.departamento,
              totalBovinos: d.totalBovinos,
              totalFincas: d.totalFincas,
              promedioFinca: d.promedioFinca,
              x: x + 10,
              y: y - 10
            });
          })
          .on("mousemove", function(event) {
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
            d3.select(this).attr("fill", "#451a03");
            setTooltip(prev => ({ ...prev, show: false }));
          });
        
        // Animación para la primera línea
        label1.transition()
          .duration(800)
          .delay(i * 30 + 400)
          .style("opacity", 1);
        
        // Segunda línea
        const label2 = svg.append("text")
          .attr("class", "municipio-label")
          .attr("x", -10)
          .attr("y", yPos + 6)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
          .attr("fill", "#451a03")
          .style("cursor", "pointer")
          .style("opacity", 0)
          .text(line2)
          .on("mouseover", function(event) {
            d3.select(this).attr("fill", "#92400e");
            
            const containerRect = containerRef.current?.getBoundingClientRect();
            const x = event.clientX - (containerRect?.left || 0);
            const y = event.clientY - (containerRect?.top || 0);
            
            setTooltip({
              show: true,
              municipio: d.municipio,
              departamento: d.departamento,
              totalBovinos: d.totalBovinos,
              totalFincas: d.totalFincas,
              promedioFinca: d.promedioFinca,
              x: x + 10,
              y: y - 10
            });
          })
          .on("mousemove", function(event) {
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
            d3.select(this).attr("fill", "#451a03");
            setTooltip(prev => ({ ...prev, show: false }));
          });
        
        // Animación para la segunda línea
        label2.transition()
          .duration(800)
          .delay(i * 30 + 400)
          .style("opacity", 1);
      } else {
        // Una sola línea
        const singleLabel = svg.append("text")
          .attr("class", "municipio-label")
          .attr("x", -10)
          .attr("y", yPos)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .attr("font-size", "12px")
          .attr("font-weight", "500")
          .attr("fill", "#451a03")
          .style("cursor", "pointer")
          .style("opacity", 0)
          .text(municipio)
          .on("mouseover", function(event) {
            d3.select(this).attr("fill", "#92400e");
            
            const containerRect = containerRef.current?.getBoundingClientRect();
            const x = event.clientX - (containerRect?.left || 0);
            const y = event.clientY - (containerRect?.top || 0);
            
            setTooltip({
              show: true,
              municipio: d.municipio,
              departamento: d.departamento,
              totalBovinos: d.totalBovinos,
              totalFincas: d.totalFincas,
              promedioFinca: d.promedioFinca,
              x: x + 10,
              y: y - 10
            });
          })
          .on("mousemove", function(event) {
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
            d3.select(this).attr("fill", "#451a03");
            setTooltip(prev => ({ ...prev, show: false }));
          });
        
        // Animación para una sola línea
        singleLabel.transition()
          .duration(800)
          .delay(i * 30 + 400)
          .style("opacity", 1);
      }
    });

    // Removido el eje X para eliminar la barra con números

  }, [animalData, farmData, selectedYear]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        <svg ref={svgRef} className="w-full"></svg>
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
                {tooltip.municipio}
              </h4>
              <p className="text-xs text-amber-700">
                {tooltip.departamento}
              </p>
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