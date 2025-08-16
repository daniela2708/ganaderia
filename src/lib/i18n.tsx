import { createContext, ReactNode, useContext, useState } from 'react';

type Language = 'en' | 'es';

const resources = {
  en: {
    header: {
      title: 'Bovine Livestock Analysis System Colombia'
    },
    tabs: {
      national: 'National Livestock Analysis',
      department: 'Department',
      municipalities: 'Municipalities',
      dataSource: 'Data Source'
    },
    loading: 'Loading cattle data...',
    error: {
      title: 'Error loading data'
    },
    rankings: {
      department: 'Department Ranking - {{year}}',
      municipality: 'Municipality Ranking - {{year}}'
    },
    filters: {
      year: 'Year of Analysis:',
      department: 'Department:',
      allDepartments: 'All Departments',
      municipality: 'Municipality:',
      allMunicipalities: 'All Municipalities',
      selectDepartment: 'Select a Department',
      active: 'Active Filters:',
      yearTag: 'Year {{year}}',
      clearDepartment: 'Clear department',
      clearMunicipality: 'Clear municipality'
    },
    metrics: {
      general: 'General Metrics'
    },
    kpi: {
      totalCattle: 'Total Cattle',
      totalFarms: 'Total Farms',
      averagePerFarm: 'Average per Farm',
      departments: 'Departments'
    },
    charts: {
      detailedAnalysis: 'Detailed Metrics Analysis',
      annualCattle: 'Annual Cattle Numbers',
      ageSexDistribution: 'Distribution of Cattle by Age and Sex',
      ageProportion: 'Proportion of Cattle by Age',
      sexProportion: 'Proportion of Cattle by Sex',
      year: 'Year',
      totalCattle: 'Total Cattle',
      totalFarms: 'Total Farms',
      averagePerFarm: 'Average per Farm',
      yoyGrowth: 'YoY Growth',
      ageRange: 'Age Range',
      genderPercentage: 'Gender Percentage',
      percentage: 'Percentage',
      cattle: 'cattle'
    }
  },
  es: {
    header: {
      title: 'Sistema de Análisis Ganadero Bovino Colombia'
    },
    tabs: {
      national: 'Análisis Ganadero Nacional',
      department: 'Departamento',
      municipalities: 'Municipios',
      dataSource: 'Fuente de Datos'
    },
    loading: 'Cargando datos ganaderos...',
    error: {
      title: 'Error al cargar datos'
    },
    rankings: {
      department: 'Ranking por Departamento - {{year}}',
      municipality: 'Ranking por Municipio - {{year}}'
    },
    filters: {
      year: 'Año de Análisis:',
      department: 'Departamento:',
      allDepartments: 'Todos los Departamentos',
      municipality: 'Municipio:',
      allMunicipalities: 'Todos los Municipios',
      selectDepartment: 'Seleccione un Departamento',
      active: 'Filtros Activos:',
      yearTag: 'Año {{year}}',
      clearDepartment: 'Limpiar departamento',
      clearMunicipality: 'Limpiar municipio'
    },
    metrics: {
      general: 'Métricas Generales'
    },
    kpi: {
      totalCattle: 'Total Bovinos',
      totalFarms: 'Total Fincas',
      averagePerFarm: 'Promedio por Finca',
      departments: 'Departamentos'
    },
    charts: {
      detailedAnalysis: 'Análisis Detallado de Métricas',
      annualCattle: 'Número de Bovinos Anuales',
      ageSexDistribution: 'Distribución de Bovinos por Edad y Sexo',
      ageProportion: 'Proporción de Bovinos por Edad',
      sexProportion: 'Proporción de Bovinos por Sexo',
      year: 'Año',
      totalCattle: 'Total Bovinos',
      totalFarms: 'Total Fincas',
      averagePerFarm: 'Promedio por Finca',
      yoyGrowth: 'Crecimiento YoY',
      ageRange: 'Rango de Edad',
      genderPercentage: 'Porcentaje del Género',
      percentage: 'Porcentaje',
      cattle: 'bovinos'
    }
  }
} as const;

interface I18nContextProps {
  lang: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string, vars: Record<string, string | number> = {}) => {
    const keys = key.split('.');
    let result: unknown = resources[lang];
    for (const k of keys) {
      result = (result as Record<string, unknown>)[k];
      if (result === undefined) return key;
    }
    if (typeof result === 'string') {
      return result.replace(/{{(\w+)}}/g, (_, v) => String(vars[v] ?? ''));
    }
    return key;
  };

  const toggleLanguage = () => setLang(prev => (prev === 'en' ? 'es' : 'en'));
  const setLanguage = (language: Language) => setLang(language);

  return (
    <I18nContext.Provider value={{ lang, t, toggleLanguage, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
