import type { ParseResult, Requirement } from '../types';
import { detectPriority } from './priority';

const HEADER_SYNONYMS: Record<'epic' | 'featureName' | 'requirementText', string[]> = {
  epic: ['epic', 'epics', 'epic name'],
  featureName: ['feature name', 'feature', 'feature names', 'short hand', 'shorthand'],
  requirementText: [
    'high level requirement',
    'high-level requirement',
    'high level requirements',
    'requirement',
    'requirements',
  ],
};

function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findColumnIndex(headerRow: string[], synonyms: string[]): number {
  const normalised = headerRow.map(normaliseHeader);
  for (const synonym of synonyms) {
    const idx = normalised.indexOf(synonym);
    if (idx !== -1) return idx;
  }
  return -1;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `req-${Date.now()}-${idCounter}`;
}

/**
 * Converts a 2D array of string cells (first row = headers) into
 * Requirement records, detecting the Epic / Feature Name / High Level
 * Requirement columns by flexible header matching.
 */
export function rowsToRequirements(rows: string[][]): ParseResult {
  const warnings: string[] = [];
  const nonEmptyRows = rows.filter((row) => row.some((cell) => cell.trim() !== ''));

  if (nonEmptyRows.length === 0) {
    return { requirements: [], warnings: ['No data found.'] };
  }

  const headerRow = nonEmptyRows[0];
  const epicIdx = findColumnIndex(headerRow, HEADER_SYNONYMS.epic);
  const featureIdx = findColumnIndex(headerRow, HEADER_SYNONYMS.featureName);
  const requirementIdx = findColumnIndex(headerRow, HEADER_SYNONYMS.requirementText);

  if (epicIdx === -1 || featureIdx === -1 || requirementIdx === -1) {
    const missing = [
      epicIdx === -1 ? 'Epic' : null,
      featureIdx === -1 ? 'Feature Name' : null,
      requirementIdx === -1 ? 'High Level Requirement' : null,
    ].filter(Boolean);
    return {
      requirements: [],
      warnings: [`Could not find column(s): ${missing.join(', ')}. Check the header row.`],
    };
  }

  const requirements: Requirement[] = [];
  let unclassifiedCount = 0;

  for (const row of nonEmptyRows.slice(1)) {
    const epic = (row[epicIdx] ?? '').trim();
    const featureName = (row[featureIdx] ?? '').trim();
    const requirementText = (row[requirementIdx] ?? '').trim();

    if (!epic && !featureName && !requirementText) continue;

    const detected = detectPriority(requirementText);
    const priority = detected ?? 'Should';
    if (!detected) unclassifiedCount += 1;

    requirements.push({
      id: nextId(),
      epic: epic || 'Unassigned',
      featureName: featureName || '(untitled feature)',
      requirementText,
      priority,
      priorityInferred: !detected,
    });
  }

  if (unclassifiedCount > 0) {
    warnings.push(
      `${unclassifiedCount} requirement(s) didn't start with "The system must/should/could..." and were placed under Should. They're marked so you can fix them.`,
    );
  }

  return { requirements, warnings };
}

/** Parses a tab- or comma-delimited block of pasted text (e.g. copied from Excel) into rows. */
export function parseDelimitedText(text: string): string[][] {
  const trimmed = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const firstLine = trimmed.split('\n', 1)[0] ?? '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  return tokenizeDelimited(trimmed, delimiter);
}

function tokenizeDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);

  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** Reads an .xlsx or .csv File into a 2D array of string cells (first sheet only). */
export async function fileToRows(file: File): Promise<string[][]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  return json.map((row) => row.map((cell) => (cell == null ? '' : String(cell))));
}
