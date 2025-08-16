import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'es';

interface I18nContextValue {
  lang: Language;
  t: (key: string) => string;
  toggle: () => void;
}

interface Translations {
  app: { title: string };
  tabs: {
    general: string;
    department: string;
    municipalities: string;
    dataSource: string;
  };
  loading: string;
  errorTitle: string;
}

const translations: Record<Language, Translations> = {
  en: {
    app: { title: 'Bovine Livestock Analysis System' },
    tabs: {
      general: 'National Livestock Analysis',
      department: 'Department',
      municipalities: 'Municipalities',
      dataSource: 'Data Source'
    },
    loading: 'Loading livestock data...',
    errorTitle: 'Error loading data'
  },
  es: {
    app: { title: 'Sistema de Análisis Ganadero Bovino' },
    tabs: {
      general: 'Análisis Ganadero Nacional',
      department: 'Departamento',
      municipalities: 'Municipios',
      dataSource: 'Fuente de Datos'
    },
    loading: 'Cargando datos ganaderos...',
    errorTitle: 'Error al cargar datos'
  }
};

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  t: (key: string) => key,
  toggle: () => {}
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string): string => {
    const parts = key.split('.');
    let result: unknown = translations[lang];
    for (const part of parts) {
      if (typeof result === 'object' && result !== null && part in result) {
        result = (result as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  };

  const toggle = () => setLang(prev => (prev === 'en' ? 'es' : 'en'));

  return (
    <I18nContext.Provider value={{ lang, t, toggle }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

