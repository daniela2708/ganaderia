import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AnimalData } from '@/types/dashboard';
import { Activity, Calendar, Users, PieChart, TrendingUp } from 'lucide-react';

interface AnalisisDetalladoProps {
  animalData: AnimalData[];
  allAnimalData: AnimalData[];
  selectedYear?: number;
}

export const AnalisisDetallado = ({ animalData, allAnimalData, selectedYear }: AnalisisDetalladoProps) => {
  const barrasAnualesRef = useRef<SVGSVGElement>(null);
  const barrasApiladasRef = useRef<SVGSVGElement>(null);
  const donaEdadRef = useRef<SVGSVGElement>(null);
  const donaSexoRef = useRef<SVGSVGElement>(null);
  const containerEdadRef = useRef<HTMLDivElement>(null);
  const containerSexoRef = useRef<HTMLDivElement>(null);
  const containerAnualesRef = useRef<HTMLDivElement>(null);
  const containerApiladasRef = useRef<HTMLDivElement>(null);

  const [tooltipEdad, setTooltipEdad] = useState<{
    show: boolean;
    edad: string;
    total: number;
    porcentaje: number;
    x: number;
    y: number;
  }>({ show: false, edad: '', total: 0, porcentaje: 0, x: 0, y: 0 });

  const [tooltipSexo, setTooltipSexo] = useState<{
    show: boolean;
    sexo: string;
    total: number;
    porcentaje: number;
    x: number;
    y: number;
  }>({ show: false, sexo: '', total: 0, porcentaje: 0, x: 0, y: 0 });

  const [tooltipAnual, setTooltipAnual] = useState<{
    show: boolean;
    año: number;
    total: number;
    yoy: number | null;
    x: number;
    y: number;
  }>({ show: false, año: 0, total: 0, yoy: null, x: 0, y: 0 });

  const [tooltipApiladas, setTooltipApiladas] = useState<{
    show: boolean;
    edad: string;
    sexo: string;
    total: number;
    porcentaje: number;
    x: number;
    y: number;
  }>({ show: false, edad: '', sexo: '', total: 0, porcentaje: 0, x: 0, y: 0 });

  // Función para formatear números
  const formatearNumero = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatearMillones = (num: number) => {
    return (num / 1000000).toFixed(0) + 'M';
  };

  const formatearEjeY = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'k';
    } else {
      return num.toString();
    }
  };

  // Colores específicos
  const coloresAnuales = {
    2018: '#F59E0B',
    2019: '#A3C65C', 
    2020: '#74C476',
    2021: '#41A65C',
    2022: '#238B45',
    2023: '#005A32',
    2024: '#31A354',
    2025: '#006D2C'
  };

  useEffect(() => {
    if (!animalData.length || !allAnimalData.length) return;

    // Limpiar SVGs
    if (barrasAnualesRef.current) d3.select(barrasAnualesRef.current).selectAll("*").remove();
    if (barrasApiladasRef.current) d3.select(barrasApiladasRef.current).selectAll("*").remove();
    if (donaEdadRef.current) d3.select(donaEdadRef.current).selectAll("*").remove();
    if (donaSexoRef.current) d3.select(donaSexoRef.current).selectAll("*").remove();

    // 1. Procesamiento de datos para gráfico de barras anuales (usar filtros de región pero NO de año)
    const datosAnuales = d3.rollup(
      allAnimalData,
      v => d3.sum(v, d => d['TOTAL BOVINOS'] || 0),
      d => d.AÑO
    );

    const datosAnualesArray = Array.from(datosAnuales, ([año, total]) => ({ año, total }))
      .sort((a, b) => a.año - b.año);

    // 2. Procesamiento para distribución por edad y sexo
    const datosPorEdadSexo = d3.rollup(
      animalData,
      v => d3.sum(v, d => d['TOTAL BOVINOS'] || 0),
      d => d['RANGO EDAD'] || 'Sin especificar',
      d => d.SEXO || 'Sin especificar'
    );

    // 3. Procesamiento para proporciones por edad
    const datosPorEdad = d3.rollup(
      animalData,
      v => d3.sum(v, d => d['TOTAL BOVINOS'] || 0),
      d => d['RANGO EDAD'] || 'Sin especificar'
    );

    // 4. Procesamiento para proporciones por sexo
    const datosPorSexo = d3.rollup(
      animalData,
      v => d3.sum(v, d => d['TOTAL BOVINOS'] || 0),
      d => d.SEXO || 'Sin especificar'
    );

    const totalGeneral = d3.sum(animalData, d => d['TOTAL BOVINOS'] || 0);

    // Crear gráfico de barras anuales
    if (barrasAnualesRef.current && datosAnualesArray.length > 0) {
      const margin = { top: 40, right: 30, bottom: 60, left: 60 };
      const width = 500 - margin.left - margin.right; // Aumentado de 400 a 500
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(barrasAnualesRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
        .domain(datosAnualesArray.map(d => d.año.toString()))
        .range([0, width])
        .padding(0.2);

      const maxValue = d3.max(datosAnualesArray, d => d.total) || 0;
      const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1]) // Agregar 10% de margen
        .range([height, 0]);


      // Barras
      g.selectAll(".bar")
        .data(datosAnualesArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.año.toString()) || 0)
        .attr("y", d => yScale(d.total))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.total))
        .attr("fill", d => coloresAnuales[d.año as keyof typeof coloresAnuales] || '#31A354')
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 0.8);
          
          const containerRect = containerAnualesRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          // Calcular YoY (Year over Year) solo si hay año anterior
          const añoAnterior = d.año - 1;
          const totalAnterior = datosAnuales.get(añoAnterior) || 0;
          const yoy = totalAnterior > 0 ? ((d.total - totalAnterior) / totalAnterior) * 100 : null;
          
          setTooltipAnual({
            show: true,
            año: d.año,
            total: d.total,
            yoy: yoy,
            x: x + 10,
            y: y - 10
          });
        })
        .on("mousemove", function(event, d) {
          const containerRect = containerAnualesRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          setTooltipAnual(prev => ({
            ...prev,
            x: x + 10,
            y: y - 10
          }));
        })
        .on("mouseout", function() {
          d3.select(this).style("opacity", 1);
          setTooltipAnual(prev => ({ ...prev, show: false }));
        });


      // Ejes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#374151");

      g.append("g")
        .call(d3.axisLeft(yScale)
          .ticks(5) // Máximo 5 valores en el eje Y
          .tickFormat(d => formatearEjeY(d as number))
        )
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#374151");
    }

    // Crear gráfico de barras apiladas
    if (barrasApiladasRef.current && datosPorEdadSexo.size > 0) {
      const margin = { top: 40, right: 30, bottom: 100, left: 60 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(barrasApiladasRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const edades = ["MENOR A 1 AÑO", "1 - 2 AÑOS", "2 - 3 AÑOS", "MAYOR A 3 AÑOS"];
      const sexos = ["MACHO", "HEMBRA"];
      
      const datosApilados = edades.map(edad => {
        const machos = datosPorEdadSexo.get(edad)?.get("MACHO") || 0;
        const hembras = datosPorEdadSexo.get(edad)?.get("HEMBRA") || 0;
        return { edad, MACHO: machos, HEMBRA: hembras, total: machos + hembras };
      });

      const xScale = d3.scaleBand()
        .domain(edades)
        .range([0, width])
        .padding(0.2);

      const maxValueApiladas = d3.max(datosApilados, d => d.total) || 0;
      const yScale = d3.scaleLinear()
        .domain([0, maxValueApiladas * 1.1]) // Agregar 10% de margen
        .range([height, 0]);

      const colorScale = d3.scaleOrdinal()
        .domain(sexos)
        .range(["#3B82F6", "#F472B6"]); // azul y rosa

      const stack = d3.stack<any>()
        .keys(sexos);

      const stackedData = stack(datosApilados);

      // Barras apiladas
      g.selectAll(".stack")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "stack")
        .attr("fill", d => colorScale(d.key) as string)
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.edad) || 0)
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("rx", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 0.8);
          
          const containerRect = containerApiladasRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          // Obtener el sexo del grupo padre
          const sexo = d3.select(this.parentNode).datum().key;
          const valorSegmento = d[1] - d[0];
          
          // Calcular el total para ese rango de edad
          const totalEdad = datosPorEdad.get(d.data.edad) || 0;
          const porcentaje = totalEdad > 0 ? (valorSegmento / totalEdad) * 100 : 0;
          
          setTooltipApiladas({
            show: true,
            edad: d.data.edad,
            sexo: sexo,
            total: valorSegmento,
            porcentaje: porcentaje,
            x: x + 10,
            y: y - 10
          });
        })
        .on("mousemove", function(event, d) {
          const containerRect = containerApiladasRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          setTooltipApiladas(prev => ({
            ...prev,
            x: x + 10,
            y: y - 10
          }));
        })
        .on("mouseout", function() {
          d3.select(this).style("opacity", 1);
          setTooltipApiladas(prev => ({ ...prev, show: false }));
        });

      // Ejes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("fill", "#374151")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      g.append("g")
        .call(d3.axisLeft(yScale)
          .ticks(5) // Máximo 5 valores en el eje Y
          .tickFormat(d => formatearEjeY(d as number))
        )
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#374151");
    }

    // Crear gráfico de dona por edad
    if (donaEdadRef.current && datosPorEdad.size > 0) {
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2 - 20;
      const innerRadius = radius * 0.6;

      const svg = d3.select(donaEdadRef.current)
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const coloresEdad = {
        "1 - 2 AÑOS": "#3B82F6",
        "2 - 3 AÑOS": "#F59E0B", 
        "MAYOR A 3 AÑOS": "#10B981",
        "MENOR A 1 AÑO": "#EF4444"
      };

      const datosEdadArray = Array.from(datosPorEdad, ([edad, total]) => ({
        edad,
        total,
        porcentaje: (total / totalGeneral) * 100
      })).sort((a, b) => b.total - a.total);

      const pie = d3.pie<any>()
        .value(d => d.total)
        .sort(null);

      const arc = d3.arc<any>()
        .innerRadius(innerRadius)
        .outerRadius(radius);

      const arcs = g.selectAll(".arc")
        .data(pie(datosEdadArray))
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => coloresEdad[d.data.edad as keyof typeof coloresEdad] || "#999")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 0.8);
          
          const containerRect = containerEdadRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          setTooltipEdad({
            show: true,
            edad: d.data.edad,
            total: d.data.total,
            porcentaje: d.data.porcentaje,
            x: x + 10,
            y: y - 10
          });
        })
        .on("mousemove", function(event, d) {
          const containerRect = containerEdadRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          setTooltipEdad(prev => ({
            ...prev,
            x: x + 10,
            y: y - 10
          }));
        })
        .on("mouseout", function() {
          d3.select(this).style("opacity", 1);
          setTooltipEdad(prev => ({ ...prev, show: false }));
        });

      // Texto en el centro
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#374151")
        .text(formatearNumero(totalGeneral));

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .style("font-size", "12px")
        .style("fill", "#6B7280")
        .text("Total Bovinos");
    }

    // Crear gráfico de dona por sexo
    if (donaSexoRef.current && datosPorSexo.size > 0) {
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2 - 20;
      const innerRadius = radius * 0.6;

      const svg = d3.select(donaSexoRef.current)
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const coloresSexo = {
        "MACHO": "#3B82F6",
        "HEMBRA": "#F472B6"
      };

      const datosSexoArray = Array.from(datosPorSexo, ([sexo, total]) => ({
        sexo,
        total,
        porcentaje: (total / totalGeneral) * 100
      })).sort((a, b) => b.total - a.total);

      const pie = d3.pie<any>()
        .value(d => d.total)
        .sort(null);

      const arc = d3.arc<any>()
        .innerRadius(innerRadius)
        .outerRadius(radius);

      const arcs = g.selectAll(".arc")
        .data(pie(datosSexoArray))
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => coloresSexo[d.data.sexo as keyof typeof coloresSexo] || "#999")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 0.8);
          
          const containerRect = containerSexoRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          setTooltipSexo({
            show: true,
            sexo: d.data.sexo,
            total: d.data.total,
            porcentaje: d.data.porcentaje,
            x: x + 10,
            y: y - 10
          });
        })
        .on("mousemove", function(event, d) {
          const containerRect = containerSexoRef.current?.getBoundingClientRect();
          const x = event.clientX - (containerRect?.left || 0);
          const y = event.clientY - (containerRect?.top || 0);
          
          setTooltipSexo(prev => ({
            ...prev,
            x: x + 10,
            y: y - 10
          }));
        })
        .on("mouseout", function() {
          d3.select(this).style("opacity", 1);
          setTooltipSexo(prev => ({ ...prev, show: false }));
        });

      // Texto en el centro
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#374151")
        .text(formatearNumero(totalGeneral));

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .style("font-size", "12px")
        .style("fill", "#6B7280")
        .text("Total Bovinos");
    }

  }, [animalData, allAnimalData, selectedYear]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-amber-100">
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
        Análisis Detallado de Métricas
      </h2>
      
      {/* Cuadrícula 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico Superior Izquierdo */}
        <div className="bg-white rounded-lg p-4 border-2 border-amber-200 shadow-md relative" ref={containerAnualesRef}>
          <h3 className="text-center font-semibold mb-4 text-gray-800">
            Número de Bovinos Anuales
          </h3>
          <div className="flex justify-center">
            <svg ref={barrasAnualesRef}></svg>
          </div>
          
          {/* Tooltip para Anuales */}
          {tooltipAnual.show && (
            <div 
              className="absolute z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg pointer-events-none"
              style={{
                left: tooltipAnual.x,
                top: tooltipAnual.y,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-600 rounded-full p-1.5">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  Año {tooltipAnual.año}
                </h4>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-700 rounded-full p-1.5">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Total Bovinos</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipAnual.total.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {tooltipAnual.yoy !== null && (
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-1.5 ${tooltipAnual.yoy >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 font-medium">Crecimiento YoY</p>
                    <p className={`text-lg font-bold ${tooltipAnual.yoy >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {tooltipAnual.yoy >= 0 ? '+' : ''}{tooltipAnual.yoy.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Gráfico Superior Derecho */}
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-md relative" ref={containerApiladasRef}>
          <h3 className="text-center font-semibold mb-4 text-gray-800">
            Distribución de Bovinos por Edad y Sexo
          </h3>
          <div className="flex justify-center">
            <svg ref={barrasApiladasRef}></svg>
          </div>
          
          {/* Tooltip para Apiladas */}
          {tooltipApiladas.show && (
            <div 
              className="absolute z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg pointer-events-none"
              style={{
                left: tooltipApiladas.x,
                top: tooltipApiladas.y,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-600 rounded-full p-1.5">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  {tooltipApiladas.sexo}
                </h4>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-700 rounded-full p-1.5">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Rango de Edad</p>
                  <p className="text-sm font-semibold text-amber-900">
                    {tooltipApiladas.edad}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-800 rounded-full p-1.5">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Total Bovinos</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipApiladas.total.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-900 rounded-full p-1.5">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Porcentaje del Género</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipApiladas.porcentaje.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Gráfico Inferior Izquierdo */}
        <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-md relative" ref={containerEdadRef}>
          <h3 className="text-center font-semibold mb-4 text-gray-800">
            Proporción de Bovinos por Edad
          </h3>
          <div className="flex justify-center">
            <svg ref={donaEdadRef}></svg>
          </div>
          
          {/* Tooltip para Edad */}
          {tooltipEdad.show && (
            <div 
              className="absolute z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg pointer-events-none"
              style={{
                left: tooltipEdad.x,
                top: tooltipEdad.y,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-600 rounded-full p-1.5">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  {tooltipEdad.edad}
                </h4>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-700 rounded-full p-1.5">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Total Bovinos</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipEdad.total.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-800 rounded-full p-1.5">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Porcentaje</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipEdad.porcentaje.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Gráfico Inferior Derecho */}
        <div className="bg-white rounded-lg p-4 border-2 border-pink-200 shadow-md relative" ref={containerSexoRef}>
          <h3 className="text-center font-semibold mb-4 text-gray-800">
            Proporción de Bovinos por Sexo
          </h3>
          <div className="flex justify-center">
            <svg ref={donaSexoRef}></svg>
          </div>
          
          {/* Tooltip para Sexo */}
          {tooltipSexo.show && (
            <div 
              className="absolute z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg pointer-events-none"
              style={{
                left: tooltipSexo.x,
                top: tooltipSexo.y,
                transform: 'translateY(-100%)'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-600 rounded-full p-1.5">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-amber-900 text-sm">
                  {tooltipSexo.sexo}
                </h4>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-700 rounded-full p-1.5">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Total Bovinos</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipSexo.total.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-800 rounded-full p-1.5">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Porcentaje</p>
                  <p className="text-lg font-bold text-amber-900">
                    {tooltipSexo.porcentaje.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};