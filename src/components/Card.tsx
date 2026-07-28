import { useDraggable } from '@dnd-kit/core';
import type { Requirement } from '../types';

interface CardProps {
  requirement: Requirement;
}

export function CardContent({ requirement }: CardProps) {
  return (
    <>
      {requirement.priorityInferred && (
        <span className="feature-card__flag" title="Priority couldn't be detected from the text">
          Check priority
        </span>
      )}
      <p className="feature-card__name">{requirement.featureName}</p>
      <p className="feature-card__requirement">{requirement.requirementText}</p>
    </>
  );
}

export function Card({ requirement }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: requirement.id,
    data: { requirement },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card feature-card feature-card--${requirement.priority.toLowerCase()}${
        isDragging ? ' feature-card--dragging' : ''
      }`}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="button"
      aria-label={`${requirement.featureName}. Drag to move to a different epic or priority.`}
    >
      <CardContent requirement={requirement} />
    </div>
  );
}
