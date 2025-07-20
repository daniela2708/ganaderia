import { useState, useEffect } from 'react';
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
import { GripVertical, MapPin, Building, Map, Home } from 'lucide-react';

const getTabIcon = (tabId: string) => {
  switch (tabId) {
    case 'departamento':
      return <MapPin className="h-4 w-4" />;
    case 'municipios':
      return <Map className="h-4 w-4" />;
    case 'metricas-generales':
      return <Building className="h-4 w-4" />;
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
    // Only trigger click if we're not dragging
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
        "px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200",
        "border border-border select-none flex items-center gap-2.5 min-w-0",
        "hover:shadow-md transform hover:scale-[1.02] active:scale-95",
        "backdrop-blur-sm",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg border-primary/50 ring-1 ring-primary/30"
          : "bg-background/80 text-foreground hover:bg-accent/80 hover:text-accent-foreground hover:border-accent/50",
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

interface DraggableTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const DraggableTabs = ({ tabs, activeTab, onTabChange }: DraggableTabsProps) => {
  const [tabItems, setTabItems] = useState(tabs);
  
  // Update tabItems when tabs prop changes
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
    <div className="bg-card border-b border-border shadow-sm fixed top-[73px] left-0 right-0 z-40">
      <div className="container mx-auto px-6 py-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tabItems} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 overflow-x-auto justify-center items-center py-1">
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
  );
};