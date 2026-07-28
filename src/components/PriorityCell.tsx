import { useDroppable } from '@dnd-kit/core';
import type { Priority, Requirement } from '../types';
import { makeCellId } from '../lib/cellId';
import { Card } from './Card';
import { AddCardForm } from './AddCardForm';

interface PriorityCellProps {
  epic: string;
  priority: Priority;
  requirements: Requirement[];
  onEdit: (id: string, featureName: string, requirementText: string) => void;
  onAdd: (epic: string, priority: Priority, featureName: string, requirementText: string) => void;
}

export function PriorityCell({ epic, priority, requirements, onEdit, onAdd }: PriorityCellProps) {
  const cellId = makeCellId(epic, priority);
  const { setNodeRef, isOver } = useDroppable({ id: cellId, data: { epic, priority } });

  return (
    <div className={`priority-row priority-row--${priority.toLowerCase()}`}>
      <p className="priority-row__label">{priority}</p>
      <div
        ref={setNodeRef}
        className={`priority-row__cards${isOver ? ' priority-row__cards--over' : ''}${
          requirements.length === 0 ? ' priority-row__cards--empty' : ''
        }`}
      >
        {requirements.length === 0 && <span className="priority-row__placeholder">Drop here</span>}
        {requirements.map((req) => (
          <Card key={req.id} requirement={req} onEdit={onEdit} />
        ))}
      </div>
      <AddCardForm epic={epic} priority={priority} onAdd={onAdd} />
    </div>
  );
}
