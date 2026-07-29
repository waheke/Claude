export type Priority = 'Must' | 'Should' | 'Could';

export const PRIORITIES: Priority[] = ['Must', 'Should', 'Could'];

export interface Requirement {
  id: string;
  epic: string;
  featureName: string;
  requirementText: string;
  priority: Priority;
  /** true if the priority couldn't be detected from the text and was defaulted */
  priorityInferred: boolean;
  /** Optional; empty string means no owner assigned. */
  owner: string;
}

export interface ParseResult {
  requirements: Requirement[];
  warnings: string[];
}
