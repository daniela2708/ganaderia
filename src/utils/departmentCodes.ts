export const codigoDepartamento: Record<string, string> = {
  "05": "ANTIOQUIA",
  "08": "ATLÁNTICO", 
  "11": "BOGOTÁ D.C.",
  "13": "BOLÍVAR",
  "15": "BOYACÁ",
  "17": "CALDAS",
  "18": "CAQUETÁ",
  "19": "CAUCA",
  "20": "CESAR",
  "23": "CÓRDOBA",
  "25": "CUNDINAMARCA",
  "27": "CHOCÓ",
  "41": "HUILA",
  "44": "LA GUAJIRA",
  "47": "MAGDALENA",
  "50": "META",
  "52": "NARIÑO",
  "54": "NORTE DE SANTANDER",
  "63": "QUINDÍO",
  "66": "RISARALDA",
  "68": "SANTANDER",
  "70": "SUCRE",
  "73": "TOLIMA",
  "76": "VALLE DEL CAUCA",
  "81": "ARAUCA",
  "85": "CASANARE",
  "86": "PUTUMAYO",
  "88": "ARCHIPIÉLAGO DE SAN ANDRÉS",
  "91": "AMAZONAS",
  "94": "GUAINÍA",
  "95": "GUAVIARE",
  "97": "VAUPÉS",
  "99": "VICHADA"
};

export const obtenerNombreDepartamento = (codigo: string): string => {
  return codigoDepartamento[codigo] || `DEPARTAMENTO_${codigo}`;
};

export const obtenerCodigoDepartamento = (codigoMunicipio: string): string => {
  return codigoMunicipio.substring(0, 2);
};