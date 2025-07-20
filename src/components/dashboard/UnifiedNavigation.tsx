import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import cattleIcon from '@/assets/cattle-icon.png';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { TabItem } from '@/types/dashboard';
import { GripVertical, MapPin, Building, Map } from 'lucide-react';

const getTabIcon = (tabId: string) => {
  switch (tabId) {
    case 'departamento':
      return <MapPin className="h-4 w-4" />;
    case 'municipios':
      return <Map className="h-4 w-4" />;
    case 'metricas-generales':
      return <Building className="h-4 w-4" />;
    case 'fuente-datos':
      return <Activity className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

interface SortableTabProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
}

const SortableTab = ({ tab, isActive, onClick }: SortableTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      console.log('Tab clicked:', tab.id);
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "nav-tab-item px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-200",
        "select-none flex items-center gap-2.5 min-w-0",
        "transform hover:scale-[1.02] active:scale-95",
        "relative border-0",
        isActive
          ? "bg-white text-primary shadow-lg rounded-t-lg"
          : "bg-transparent text-white hover:bg-white/10 hover:text-white rounded-t-lg",
        isDragging && "opacity-50 shadow-xl z-10 scale-105"
      )}
      onClick={handleClick}
      title={tab.title}
    >
      <GripVertical className="h-4 w-4 opacity-30 hover:opacity-60 transition-all duration-200 cursor-grab active:cursor-grabbing" {...attributes} {...listeners} />
      <div className="flex items-center gap-2">
        {getTabIcon(tab.id)}
        <span className="text-center whitespace-nowrap hidden sm:inline">{tab.title}</span>
      </div>
    </div>
  );
};

interface UnifiedNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const UnifiedNavigation = ({ tabs, activeTab, onTabChange }: UnifiedNavigationProps) => {
  const [tabItems, setTabItems] = useState(tabs);
  
  useEffect(() => {
    setTabItems(tabs);
  }, [tabs]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTabItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg">
      {/* Header Section */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            <img 
              src={cattleIcon} 
              alt="Cattle Analysis"
              className="w-20 h-20 object-contain drop-shadow-sm rounded-full bg-white/10 p-2"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-wide">
              Sistema de Análisis Ganadero Bovino
            </h1>
          </div>
        </div>
      </div>
      
      {/* Tabs Section */}
      <div className="bg-primary relative overflow-hidden border-0">
        <div className="container mx-auto px-6 py-1.5 border-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tabItems} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 overflow-x-auto justify-center items-end pb-0 border-0 nav-tabs-container">
              {tabItems.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => onTabChange(tab.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        </div>
      </div>
    </nav>
  );
}; 