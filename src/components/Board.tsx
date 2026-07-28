import { useRef, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Priority, Requirement } from '../types';
import { parseCellId } from '../lib/cellId';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { EpicColumn } from './EpicColumn';
import { CardContent } from './Card';

interface BoardProps {
  requirements: Requirement[];
  epics: string[];
  onMove: (requirementId: string, targetEpic: string, targetPriority: Requirement['priority']) => void;
  onEdit: (id: string, featureName: string, requirementText: string) => void;
  onAdd: (epic: string, priority: Priority, featureName: string, requirementText: string) => void;
  zoom: number;
  onZoomBy: (delta: number) => void;
  onZoomScale: (factor: number) => void;
}

export function Board({ requirements, epics, onMove, onEdit, onAdd, zoom, onZoomBy, onZoomScale }: BoardProps) {
  const [activeRequirement, setActiveRequirement] = useState<Requirement | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const boardRef = useRef<HTMLDivElement>(null);

  usePinchZoom(boardRef, { onZoomBy, onZoomScale });

  function handleDragStart(event: DragStartEvent) {
    const requirement = event.active.data.current?.requirement as Requirement | undefined;
    setActiveRequirement(requirement ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveRequirement(null);
    const { active, over } = event;
    if (!over) return;
    const target = parseCellId(String(over.id));
    if (!target) return;
    onMove(String(active.id), target.epic, target.priority);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="board" id="board-capture" ref={boardRef} style={{ zoom }}>
        {epics.map((epic) => (
          <EpicColumn
            key={epic}
            epic={epic}
            requirements={requirements.filter((r) => r.epic === epic)}
            onEdit={onEdit}
            onAdd={onAdd}
          />
        ))}
      </div>
      <DragOverlay>
        {activeRequirement && (
          <div
            className={`card feature-card feature-card--${activeRequirement.priority.toLowerCase()} feature-card--overlay`}
          >
            <CardContent requirement={activeRequirement} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
