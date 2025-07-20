import { AnimalData, FarmData } from '@/types/dashboard';
import { YearFilterSection } from './YearFilterSection';
import { MunicipiosFilterSection } from './MunicipiosFilterSection';
import { MetricasFilterSection } from './MetricasFilterSection';
import { MetricsSection } from './MetricsSection';
import { TablaDepartamentos } from './TablaDepartamentos';
import { TablaMunicipios } from './TablaMunicipios';
import { RankingDepartamentos } from './RankingDepartamentos';
import { RankingMunicipios } from './RankingMunicipios';
import { AnalisisDetallado } from './AnalisisDetallado';
import { ActiveFiltersTags } from './ActiveFiltersTags';
import { procesarDatosBovinos } from '@/utils/dataProcessor';
import { useState } from 'react';

interface TabContentProps {
  tabId: string;
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

export const TabContent = ({ 
  tabId, 
  animalData, 
  farmData, 
  selectedYear, 
  onYearChange, 
  availableYears 
}: TabContentProps) => {
  console.log('TabContent render - tabId:', tabId);
  
  // Estado para el departamento seleccionado en la tab de municipios
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('');
  
  // Estados para los filtros de métricas generales
  const [selectedDepartamentoMetricas, setSelectedDepartamentoMetricas] = useState<string>('');
  const [selectedMunicipioMetricas, setSelectedMunicipioMetricas] = useState<string>('');
  
  const getTabTitle = () => {
    switch (tabId) {
      case 'departamento':
        return 'Información por Departamento';
      case 'municipios':
        return 'Información por Municipios';
      case 'metricas-generales':
        return 'Análisis Ganadero Nacional';
      case 'fuente-datos':
        return 'Fuente de Datos';
      default:
        return 'Información por Departamento';
    }
  };

  const title = getTabTitle();

  // Render department dashboard for departamento tab
  if (tabId === 'departamento') {
    console.log('=== TabContent - Departamento ===');
    console.log('animalData length:', animalData.length);
    console.log('selectedYear:', selectedYear);
    console.log('Primeros 3 animalData:', animalData.slice(0, 3));
    
    const datosBovinosProcesados = procesarDatosBovinos(animalData, selectedYear);
    
    // Filtrar datos de fincas para departamento
    const datosFincasFiltradosDpto = farmData.filter(d => d.AÑO === selectedYear);
    
    console.log('Datos procesados recibidos:', datosBovinosProcesados.length);
    console.log('Primeros 3 procesados:', datosBovinosProcesados.slice(0, 3));
    
    const handleDepartmentClick = (departamento: string) => {
      console.log('Departamento seleccionado:', departamento);
    };
    
    return (
      <div className="container mx-auto p-4">
        {/* Filtro de año */}
        <div className="mb-6">
          <YearFilterSection
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            availableYears={availableYears}
          />
        </div>
        
        {/* Métricas Generales */}
        <div className="mb-6">
          <MetricsSection
            animalData={animalData}
            farmData={datosFincasFiltradosDpto}
            selectedYear={selectedYear}
          />
        </div>
        
        {/* Grid con ranking y tabla */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-medium text-amber-900 text-center">
                Ranking por Departamento - {selectedYear}
              </h3>
            </div>
            <RankingDepartamentos 
              animalData={animalData}
              farmData={datosFincasFiltradosDpto}
              selectedYear={selectedYear}
            />
          </div>

          <div>
            <TablaDepartamentos 
              animalData={animalData}
              farmData={datosFincasFiltradosDpto}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render municipality dashboard for municipios tab
  if (tabId === 'municipios') {
    console.log('=== TabContent - Municipios ===');
    console.log('animalData length:', animalData.length);
    console.log('selectedYear:', selectedYear);
    console.log('selectedDepartamento:', selectedDepartamento);
    
    // Filtrar datos por año y departamento seleccionado
    let datosFiltrados = animalData.filter(d => d.AÑO === selectedYear);
    if (selectedDepartamento) {
      datosFiltrados = datosFiltrados.filter(d => d.DEPARTAMENTO === selectedDepartamento);
    }
    
    // Filtrar datos de fincas para municipios
    let datosFincasFiltradosMun = farmData.filter(d => d.AÑO === selectedYear);
    if (selectedDepartamento) {
      datosFincasFiltradosMun = datosFincasFiltradosMun.filter(d => d.DEPARTAMENTO === selectedDepartamento);
    }
    
    const datosBovinosProcesados = procesarDatosBovinos(datosFiltrados, selectedYear);
    
    const handleMunicipioClick = (municipio: string) => {
      console.log('Municipio seleccionado:', municipio);
    };
    
    return (
      <div className="container mx-auto p-4">
        {/* Filtros de año y departamento */}
        <div className="mb-6">
          <MunicipiosFilterSection
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            availableYears={availableYears}
            selectedDepartamento={selectedDepartamento}
            onDepartamentoChange={setSelectedDepartamento}
            animalData={animalData}
          />
        </div>
        
        {/* Tags de filtros activos */}
        <ActiveFiltersTags
          selectedYear={selectedYear}
          selectedDepartamento={selectedDepartamento}
          selectedMunicipio=""
          onClearDepartamento={() => setSelectedDepartamento('')}
          onClearMunicipio={() => {}}
        />
        
        {/* Métricas Generales */}
        <div className="mb-6">
          <MetricsSection
            animalData={datosFiltrados}
            farmData={datosFincasFiltradosMun}
            selectedYear={selectedYear}
          />
        </div>
        
        {/* Grid con ranking y tabla */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-medium text-amber-900 text-center">
                Ranking por Municipio - {selectedYear}
              </h3>
            </div>
            <RankingMunicipios 
              animalData={datosFiltrados}
              farmData={datosFincasFiltradosMun}
              selectedYear={selectedYear}
            />
          </div>

          <div>
            <TablaMunicipios 
              animalData={datosFiltrados}
              farmData={datosFincasFiltradosMun}
              selectedYear={selectedYear}
              selectedDepartamento={selectedDepartamento}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render metrics dashboard for metricas-generales tab
  if (tabId === 'metricas-generales') {
    console.log('=== TabContent - Métricas Generales ===');
    console.log('animalData length:', animalData.length);
    console.log('selectedYear:', selectedYear);
    console.log('selectedDepartamentoMetricas:', selectedDepartamentoMetricas);
    console.log('selectedMunicipioMetricas:', selectedMunicipioMetricas);
    
    // Filtrar datos por año, departamento y municipio seleccionados
    let datosFiltrados = animalData.filter(d => d.AÑO === selectedYear);
    
    if (selectedDepartamentoMetricas) {
      datosFiltrados = datosFiltrados.filter(d => d.DEPARTAMENTO === selectedDepartamentoMetricas);
    }
    
    if (selectedMunicipioMetricas) {
      datosFiltrados = datosFiltrados.filter(d => d.MUNICIPIO === selectedMunicipioMetricas);
    }

    // Para el gráfico anual: filtrar por región pero NO por año
    let datosRegionales = animalData; // Todos los años
    
    if (selectedDepartamentoMetricas) {
      datosRegionales = datosRegionales.filter(d => d.DEPARTAMENTO === selectedDepartamentoMetricas);
    }
    
    if (selectedMunicipioMetricas) {
      datosRegionales = datosRegionales.filter(d => d.MUNICIPIO === selectedMunicipioMetricas);
    }

    // Filtrar datos de fincas con los mismos criterios que animalData
    let datosFincasFiltrados = farmData.filter(d => d.AÑO === selectedYear);
    
    if (selectedDepartamentoMetricas) {
      datosFincasFiltrados = datosFincasFiltrados.filter(d => d.DEPARTAMENTO === selectedDepartamentoMetricas);
    }
    
    if (selectedMunicipioMetricas) {
      datosFincasFiltrados = datosFincasFiltrados.filter(d => d.MUNICIPIO === selectedMunicipioMetricas);
    }
    
    return (
      <div className="container mx-auto p-4">
        {/* Filtros de año, departamento y municipio */}
        <div className="mb-6">
          <MetricasFilterSection
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            availableYears={availableYears}
            selectedDepartamento={selectedDepartamentoMetricas}
            onDepartamentoChange={setSelectedDepartamentoMetricas}
            selectedMunicipio={selectedMunicipioMetricas}
            onMunicipioChange={setSelectedMunicipioMetricas}
            animalData={animalData}
          />
        </div>
        
        {/* Tags de filtros activos */}
        <ActiveFiltersTags
          selectedYear={selectedYear}
          selectedDepartamento={selectedDepartamentoMetricas}
          selectedMunicipio={selectedMunicipioMetricas}
          onClearDepartamento={() => setSelectedDepartamentoMetricas('')}
          onClearMunicipio={() => setSelectedMunicipioMetricas('')}
        />
        
        {/* Métricas Generales */}
        <div className="mb-6">
          <MetricsSection
            animalData={datosFiltrados}
            farmData={datosFincasFiltrados}
            selectedYear={selectedYear}
          />
        </div>
        
        {/* Análisis Detallado con visualizaciones */}
        <AnalisisDetallado 
          animalData={datosFiltrados}
          allAnimalData={datosRegionales}
          selectedYear={selectedYear}
        />
      </div>
    );
  }

  // Render fuente de datos content
  if (tabId === 'fuente-datos') {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg border border-amber-100 p-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">
            Fuente de Datos
          </h2>
          
          <div className="space-y-8 text-amber-800">
            {/* Información Relevante */}
            <section>
              <h3 className="text-2xl font-semibold text-amber-900 mb-4">
                ℹ️ Información Relevante
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-600 text-white rounded-lg p-2 flex-shrink-0">
                      📅
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Período de Referencia</h4>
                      <p className="text-amber-800 text-sm">
                        Los datos corresponden al período 2018-2025, consolidados anualmente 
                        por el ICA con información de registros de vacunación y productores.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-600 text-white rounded-lg p-2 flex-shrink-0">
                      🔗
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Fuente Oficial</h4>
                      <p className="text-amber-800 text-sm">
                        Instituto Colombiano Agropecuario (ICA) - 
                        <a href="https://www.ica.gov.co/areas/pecuaria/servicios/epidemiologia-veterinaria/censos-2016/censo-2018" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-800 underline ml-1">
                          Censo Pecuario Nacional
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-600 text-white rounded-lg p-2 flex-shrink-0">
                      📊
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Uso de los Datos</h4>
                      <p className="text-amber-800 text-sm">
                        Esta información está disponible para análisis académicos, 
                        planificación sectorial y toma de decisiones en políticas públicas 
                        relacionadas con el sector ganadero colombiano.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Información del Dataset */}
            <section>
              <h3 className="text-2xl font-semibold text-amber-900 mb-4">
                📊 Dataset de Censo Bovino
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-lg leading-relaxed mb-4">
                  Este tablero de análisis ganadero se basa en datos oficiales del <strong>Censo Pecuario Nacional</strong> 
                  realizado por el Instituto Colombiano Agropecuario (ICA) de Colombia.
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  Los datos incluyen información detallada sobre la población bovina a nivel departamental y municipal, 
                  consolidados anualmente desde 2018 hasta 2025, incluyendo conteos por tipo de animal, rangos de edad, 
                  sexo y distribución geográfica.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                                         <h4 className="font-semibold text-amber-900 mb-2">📈 Variables Principales</h4>
                     <ul className="text-sm space-y-1">
                       <li>• Total de bovinos por región</li>
                       <li>• Distribución por departamentos</li>
                       <li>• Conteo por municipios</li>
                       <li>• Clasificación por edad y sexo</li>
                       <li>• Registros de vacunación</li>
                       <li>• Información de productores</li>
                     </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                                         <h4 className="font-semibold text-amber-900 mb-2">🗺️ Cobertura Geográfica</h4>
                     <ul className="text-sm space-y-1">
                       <li>• Todos los departamentos de Colombia</li>
                       <li>• Municipios con actividad ganadera</li>
                       <li>• Datos consolidados anualmente</li>
                       <li>• Período 2018-2025</li>
                     </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Proceso de Datos */}
            <section>
              <h3 className="text-2xl font-semibold text-amber-900 mb-4">
                🔄 Proceso de Procesamiento de Datos
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      1
                    </div>
                    <div>
                                           <h4 className="font-semibold text-amber-900 mb-2">Recolección de Datos</h4>
                     <p className="text-amber-800">
                       Los datos se obtienen de múltiples fuentes: registros de vacunación bovina, 
                       información de productores representados por gremios, y visitas de vigilancia 
                       activa y pasiva del ICA.
                     </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      2
                    </div>
                    <div>
                                           <h4 className="font-semibold text-amber-900 mb-2">Consolidación y Validación</h4>
                     <p className="text-amber-800">
                       Los datos se consolidan anualmente por especie, municipio y departamento, 
                       complementándose con información de UMATAS, secretarías de Desarrollo 
                       Agropecuario y registros de vigilancia del ICA.
                     </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      3
                    </div>
                    <div>
                                           <h4 className="font-semibold text-amber-900 mb-2">Procesamiento de Datos</h4>
                     <p className="text-amber-800">
                       Se seleccionaron y procesaron específicamente los datos de bovinos del 
                       período 2018-2025, organizándolos por diferentes dimensiones (geográficas, 
                       temporales, demográficas) para facilitar el análisis.
                     </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      4
                    </div>
                    <div>
                                           <h4 className="font-semibold text-amber-900 mb-2">Visualización Interactiva</h4>
                     <p className="text-amber-800">
                       Los datos consolidados de bovinos se presentan en este tablero interactivo 
                       que permite explorar la información de manera dinámica y accesible, 
                       facilitando el análisis del sector ganadero colombiano.
                     </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            

            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in bg-gradient-to-br from-amber-25 to-green-25 min-h-screen p-6 rounded-lg">
      <YearFilterSection
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        availableYears={availableYears}
      />
      
      <MetricsSection
        animalData={animalData}
        farmData={farmData}
        selectedYear={selectedYear}
      />
      
      <div className="bg-white p-8 rounded-lg shadow-lg border border-amber-100">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">{title}</h2>
        <div className="text-center text-amber-700 py-12">
          <p className="text-lg">Contenido específico para {title.toLowerCase()} se mostrará aquí</p>
          <p className="text-sm mt-2 text-amber-600">Próximamente se agregarán visualizaciones y análisis detallados</p>
        </div>
      </div>
    </div>
  );
};