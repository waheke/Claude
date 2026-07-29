import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Requirement } from '../types';
import { EditIcon } from './icons';
import { OwnerBadge } from './OwnerBadge';

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

interface EditableCardProps extends CardProps {
  onEdit: (id: string, featureName: string, requirementText: string) => void;
  owners: string[];
  onChangeOwner: (id: string, owner: string) => void;
}

export function Card({ requirement, onEdit, owners, onChangeOwner }: EditableCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(requirement.featureName);
  const [draftRequirement, setDraftRequirement] = useState(requirement.requirementText);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: requirement.id,
    data: { requirement },
    disabled: isEditing,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  function startEditing() {
    setDraftName(requirement.featureName);
    setDraftRequirement(requirement.requirementText);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function save() {
    const name = draftName.trim();
    const text = draftRequirement.trim();
    if (!name || !text) {
      cancelEditing();
      return;
    }
    onEdit(requirement.id, name, text);
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  }

  if (isEditing) {
    return (
      <div className={`card feature-card feature-card--${requirement.priority.toLowerCase()} feature-card--editing`}>
        <label className="visually-hidden" htmlFor={`name-${requirement.id}`}>
          Feature name
        </label>
        <input
          id={`name-${requirement.id}`}
          className="feature-card__name-input"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <label className="visually-hidden" htmlFor={`requirement-${requirement.id}`}>
          High level requirement
        </label>
        <textarea
          id={`requirement-${requirement.id}`}
          className="feature-card__requirement-input"
          value={draftRequirement}
          onChange={(e) => setDraftRequirement(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        <div className="feature-card__edit-actions">
          <button type="button" className="nhsuk-button nhsuk-button--small" onClick={save}>
            Save
          </button>
          <button
            type="button"
            className="nhsuk-button nhsuk-button--secondary nhsuk-button--small"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

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
      <button
        type="button"
        className="feature-card__edit-button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          startEditing();
        }}
        aria-label={`Edit ${requirement.featureName}`}
        title="Edit"
      >
        <EditIcon />
      </button>
      <CardContent requirement={requirement} />
      <OwnerBadge
        owner={requirement.owner}
        owners={owners}
        onChange={(owner) => onChangeOwner(requirement.id, owner)}
      />
    </div>
  );
}
