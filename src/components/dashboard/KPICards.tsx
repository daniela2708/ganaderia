import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Building2, TrendingUp, MapPin } from 'lucide-react';
import { AnimalData, FarmData } from '@/types/dashboard';

interface KPICardsProps {
  animalData: AnimalData[];
  farmData: FarmData[];
  selectedYear: number;
}

export const KPICards = ({ animalData, farmData, selectedYear }: KPICardsProps) => {
  const yearData = animalData.filter(item => item.AÑO === selectedYear);
  const yearFarmData = farmData.filter(item => item.AÑO === selectedYear);
  
  const totalAnimals = yearData.reduce((sum, item) => sum + item['TOTAL BOVINOS'], 0);
  const totalFarms = yearFarmData.reduce((sum, item) => sum + item['TOTAL FINCAS'], 0);
  const uniqueDepartments = new Set(yearData.map(item => item.DEPARTAMENTO)).size;
  const uniqueMunicipalities = new Set(yearData.map(item => item.MUNICIPIO)).size;
  
  const avgAnimalsPerFarm = totalFarms > 0 ? Math.round(totalAnimals / totalFarms) : 0;

  const kpis = [
    {
      title: "Total Bovinos",
      value: totalAnimals.toLocaleString('es-CO'),
      icon: Activity,
      color: "text-amber-700"
    },
    {
      title: "Total Fincas",
      value: totalFarms.toLocaleString('es-CO'),
      icon: Building2,
      color: "text-amber-600"
    },
    {
      title: "Promedio por Finca",
      value: avgAnimalsPerFarm.toLocaleString('es-CO'),
      icon: TrendingUp,
      color: "text-orange-600"
    },
    {
      title: "Departamentos",
      value: uniqueDepartments.toString(),
      icon: MapPin,
      color: "text-yellow-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      {kpis.map((kpi, index) => (
        <Card 
          key={index} 
          className={`bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up border`}
          style={{ 
            animationDelay: `${index * 100}ms`,
            borderColor: kpi.color.replace('text-', '').includes('amber') ? '#fbbf24' : 
                        kpi.color.replace('text-', '').includes('orange') ? '#fb923c' : 
                        kpi.color.replace('text-', '').includes('yellow') ? '#facc15' : '#fbbf24'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-amber-950">
              {kpi.title}
            </CardTitle>
            <div className="bg-amber-950 rounded-lg p-1.5">
              <div className="bg-white rounded-full p-1">
                <kpi.icon className={`h-3 w-3 ${kpi.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};