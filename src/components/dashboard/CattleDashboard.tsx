import { useState, useEffect } from 'react';
import { useCSVData } from '@/hooks/useCSVData';
import { UnifiedNavigation } from './UnifiedNavigation';
import { TabContent } from './TabContent';
import { TabItem } from '@/types/dashboard';
import { Loader } from 'lucide-react';

export const CattleDashboard = () => {
  const { animalData, farmData, loading, error } = useCSVData();
  const [activeTab, setActiveTab] = useState('metricas-generales');

  const tabs: TabItem[] = [
    {
      id: 'metricas-generales',
      title: 'Análisis Ganadero Nacional',
      content: null
    },
    {
      id: 'departamento',
      title: 'Departamento',
      content: null
    },
    {
      id: 'municipios',
      title: 'Municipios',
      content: null
    },
    {
      id: 'fuente-datos',
      title: 'Fuente de Datos',
      content: null
    }
  ];

  const availableYears = Array.from(
    new Set([...animalData.map(d => d.AÑO), ...farmData.map(d => d.AÑO)])
  ).sort((a, b) => a - b);

  const [selectedYear, setSelectedYear] = useState(2018);

  // Actualizar al año más reciente cuando los datos se carguen
  useEffect(() => {
    if (availableYears.length > 0) {
      const mostRecentYear = Math.max(...availableYears);
      setSelectedYear(mostRecentYear);
    }
  }, [availableYears.length]); // Solo ejecutar cuando cambie la cantidad de años disponibles

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="pt-40 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="text-lg">Cargando datos ganaderos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="pt-40 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          console.log('Tab change requested:', tabId);
          setActiveTab(tabId);
        }}
      />
      
      <main className="container mx-auto px-6 py-8 pt-40">
        <TabContent
          tabId={activeTab}
          animalData={animalData}
          farmData={farmData}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </main>
    </div>
  );
};