import type { Priority } from '../types';

const SEPARATOR = '::';

export function makeCellId(epic: string, priority: Priority): string {
  return `${epic}${SEPARATOR}${priority}`;
}

export function parseCellId(cellId: string): { epic: string; priority: Priority } | null {
  const idx = cellId.lastIndexOf(SEPARATOR);
  if (idx === -1) return null;
  const epic = cellId.slice(0, idx);
  const priority = cellId.slice(idx + SEPARATOR.length) as Priority;
  return { epic, priority };
}
