import type { Priority } from '../types';

const PRIORITY_PATTERN = /^(\s*\S+\s+\S+\s+)(must|should|could)\b/i;

const WORD_TO_PRIORITY: Record<string, Priority> = {
  must: 'Must',
  should: 'Should',
  could: 'Could',
};

const PRIORITY_TO_WORD: Record<Priority, string> = {
  Must: 'must',
  Should: 'should',
  Could: 'could',
};

/**
 * Detects priority from the third word of requirement text, e.g.
 * "The system must ..." -> Must. Returns null if the pattern isn't found.
 */
export function detectPriority(requirementText: string): Priority | null {
  const match = PRIORITY_PATTERN.exec(requirementText);
  if (!match) return null;
  return WORD_TO_PRIORITY[match[2].toLowerCase()] ?? null;
}

/**
 * Rewrites the third word of requirement text to match a new priority,
 * preserving everything else (including original casing of the rest of
 * the sentence). Falls back to prefixing the text if no third word is
 * found to replace.
 */
export function rewritePriorityWord(requirementText: string, newPriority: Priority): string {
  const targetWord = PRIORITY_TO_WORD[newPriority];
  const match = PRIORITY_PATTERN.exec(requirementText);
  if (!match) {
    return requirementText;
  }
  const original = match[2];
  const cased = matchCase(original, targetWord);
  return requirementText.slice(0, match[1].length) + cased + requirementText.slice(match[1].length + original.length);
}

function matchCase(sample: string, word: string): string {
  if (sample === sample.toUpperCase()) return word.toUpperCase();
  if (sample[0] === sample[0].toUpperCase()) return word[0].toUpperCase() + word.slice(1);
  return word;
}
