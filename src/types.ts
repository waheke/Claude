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
}

export interface ParseResult {
  requirements: Requirement[];
  warnings: string[];
}
