import type { Requirement } from '../types';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Builds CSV text matching the input structure: Epic, Feature Name, High Level Requirement, Owner. */
export function requirementsToCsv(requirements: Requirement[]): string {
  const header = ['Epic', 'Feature Name', 'High Level Requirement', 'Owner'];
  const lines = [header.map(csvEscape).join(',')];
  for (const req of requirements) {
    lines.push(
      [req.epic, req.featureName, req.requirementText, req.owner].map(csvEscape).join(','),
    );
  }
  return lines.join('\r\n');
}

export function downloadCsv(requirements: Requirement[], filename = 'feature-map.csv'): void {
  const csv = requirementsToCsv(requirements);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
