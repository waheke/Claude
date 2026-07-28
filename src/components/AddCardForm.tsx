import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Priority } from '../types';
import { templateForPriority } from '../lib/priority';

interface AddCardFormProps {
  epic: string;
  priority: Priority;
  onAdd: (epic: string, priority: Priority, featureName: string, requirementText: string) => void;
}

export function AddCardForm({ epic, priority, onAdd }: AddCardFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftRequirement, setDraftRequirement] = useState('');

  function startAdding() {
    setDraftName('');
    setDraftRequirement(templateForPriority(priority));
    setIsAdding(true);
  }

  function cancel() {
    setIsAdding(false);
  }

  function save() {
    const name = draftName.trim();
    const text = draftRequirement.trim();
    if (!name || !text) return;
    onAdd(epic, priority, name, text);
    setIsAdding(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  }

  if (!isAdding) {
    return (
      <button type="button" className="add-card-button" onClick={startAdding}>
        + Add card
      </button>
    );
  }

  return (
    <div className={`card feature-card feature-card--${priority.toLowerCase()} feature-card--editing`}>
      <label className="visually-hidden" htmlFor={`new-name-${epic}-${priority}`}>
        Feature name
      </label>
      <input
        id={`new-name-${epic}-${priority}`}
        className="feature-card__name-input"
        placeholder="Feature name"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <label className="visually-hidden" htmlFor={`new-requirement-${epic}-${priority}`}>
        High level requirement
      </label>
      <textarea
        id={`new-requirement-${epic}-${priority}`}
        className="feature-card__requirement-input"
        value={draftRequirement}
        onChange={(e) => setDraftRequirement(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
      />
      <div className="feature-card__edit-actions">
        <button type="button" className="nhsuk-button nhsuk-button--small" onClick={save}>
          Add
        </button>
        <button
          type="button"
          className="nhsuk-button nhsuk-button--secondary nhsuk-button--small"
          onClick={cancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
