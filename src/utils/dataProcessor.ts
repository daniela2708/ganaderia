import { AnimalData } from '@/types/dashboard';

export interface DatosBovinosProcesados {
  departamento: string;
  codigoDepartamento: string;
  totalBovinos: number;
  año: number;
}

export const formatearNumero = (numero: number): string => {
  return new Intl.NumberFormat('es-CO').format(numero);
};

export const procesarDatosBovinos = (datos: AnimalData[], añoSeleccionado: number): DatosBovinosProcesados[] => {
  // Filtrar por año
  const datosFiltrados = datos.filter(d => d.AÑO === añoSeleccionado);
  
  // Agrupar por departamento
  const agrupados = new Map<string, number>();
  
  datosFiltrados.forEach(d => {
    const dept = d.DEPARTAMENTO;
    const bovinos = d['TOTAL BOVINOS'] || 0;
    
    agrupados.set(dept, (agrupados.get(dept) || 0) + bovinos);
  });
  
  // Convertir a array
  const resultado: DatosBovinosProcesados[] = [];
  
  agrupados.forEach((totalBovinos, departamento) => {
    resultado.push({
      departamento,
      codigoDepartamento: '', // Se puede agregar lógica para obtener el código
      totalBovinos,
      año: añoSeleccionado
    });
  });
  
  return resultado;
};



// Función para normalizar nombres de departamentos
export const normalizarNombreDepartamento = (nombre: string): string => {
  // Primero convertir a formato título (Primera letra mayúscula, resto minúscula)
  const formatoTitulo = nombre.split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
  
  // Aplicar normalizaciones específicas para casos especiales
  const normalizaciones: Record<string, string> = {
    'Bogotá, D.c.': 'Bogotá',
    'Bogotá D.c.': 'Bogotá',
    'Bogota, D.c.': 'Bogotá',
    'Bogota D.c.': 'Bogotá',
    'San Andrés Y Providencia': 'San Andrés Y Providencia',
    'San Andres Y Providencia': 'San Andrés Y Providencia',
    'Archipiélago De San Andrés': 'San Andrés Y Providencia',
    'Archipielago De San Andres': 'San Andrés Y Providencia',
    'Valle Del Cauca': 'Valle Del Cauca',
    'Norte De Santander': 'Norte De Santander'
  };
  
  return normalizaciones[formatoTitulo] || formatoTitulo;
};

export const obtenerColorPorCantidad = (totalBovinos: number): string => {
  if (totalBovinos === 0) return '#f5f5f5';
  if (totalBovinos < 50000) return '#e5f5e0';
  if (totalBovinos < 200000) return '#a1d99b';
  if (totalBovinos < 500000) return '#74c476';
  if (totalBovinos < 1000000) return '#31a354';
  return '#006d2c';
};

export const calcularPromedioNacional = (datos: DatosBovinosProcesados[]): number => {
  const total = datos.reduce((sum, item) => sum + item.totalBovinos, 0);
  return Math.round(total / datos.length);
};