import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { AnimalData, FarmData } from '@/types/dashboard';

export const useCSVData = () => {
  const [animalData, setAnimalData] = useState<AnimalData[]>([]);
  const [farmData, setFarmData] = useState<FarmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCSVData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load animals data
      const animalsResponse = await fetch('/data/censo_bovino_animales_consolidado.csv');
      const animalsText = await animalsResponse.text();
      
      const animalsResult = Papa.parse<AnimalData>(animalsText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, header) => {
          if (header === 'AÑO' || header === 'TOTAL BOVINOS') {
            return parseInt(value, 10);
          }
          return value;
        }
      });

      // Load farms data
      const farmsResponse = await fetch('/data/censo_bovino_fincas_consolidado.csv');
      const farmsText = await farmsResponse.text();
      
      const farmsResult = Papa.parse<FarmData>(farmsText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, header) => {
          if (header === 'AÑO' || header === 'TOTAL FINCAS') {
            return parseInt(value, 10);
          }
          return value;
        }
      });

      if (animalsResult.errors.length > 0 || farmsResult.errors.length > 0) {
        throw new Error('Error parsing CSV files');
      }

      setAnimalData(animalsResult.data);
      setFarmData(farmsResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCSVData();
  }, []);

  return {
    animalData,
    farmData,
    loading,
    error,
    refetch: loadCSVData
  };
};