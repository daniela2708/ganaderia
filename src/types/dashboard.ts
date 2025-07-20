export interface AnimalData {
  'TIPO ANIMAL': string;
  DEPARTAMENTO: string;
  MUNICIPIO: string;
  'CODIGO MUNICIPIO': string;
  AÑO: number;
  TERNERO: string;
  SEXO: string;
  'RANGO EDAD': string;
  'TOTAL BOVINOS': number;
}

export interface FarmData {
  TIPO: string;
  DEPARTAMENTO: string;
  MUNICIPIO: string;
  'CODIGO MUNICIPIO': string;
  AÑO: number;
  'TAMAÑO FINCA': string;
  'TOTAL FINCAS': number;
}

export interface DepartmentSummary {
  departamento: string;
  total: number;
  years: number[];
}

export interface MunicipalitySummary {
  municipio: string;
  departamento: string;
  total: number;
  years: number[];
}

export interface TabItem {
  id: string;
  title: string;
  content: React.ReactNode;
}