import { PRIORITIES } from '../types';
import type { Priority, Requirement } from '../types';
import { PriorityCell } from './PriorityCell';

interface EpicColumnProps {
  epic: string;
  requirements: Requirement[];
  owners: string[];
  onEdit: (id: string, featureName: string, requirementText: string) => void;
  onAdd: (epic: string, priority: Priority, featureName: string, requirementText: string) => void;
  onChangeOwner: (id: string, owner: string) => void;
}

export function EpicColumn({ epic, requirements, owners, onEdit, onAdd, onChangeOwner }: EpicColumnProps) {
  return (
    <section className="epic-column" aria-label={`Epic: ${epic}`}>
      <h2 className="epic-column__heading">{epic}</h2>
      {PRIORITIES.map((priority) => (
        <PriorityCell
          key={priority}
          epic={epic}
          priority={priority}
          requirements={requirements.filter((r) => r.priority === priority)}
          owners={owners}
          onEdit={onEdit}
          onAdd={onAdd}
          onChangeOwner={onChangeOwner}
        />
      ))}
    </section>
  );
}
