import type { FlavorGrenadeStatus } from './status-presentation.js';
import { getStatusQuickActions } from './status-presentation.js';

export interface StatusActionItem {
  command: string;
  description: string;
  label: string;
}

export function createStatusActionItems(status: FlavorGrenadeStatus): StatusActionItem[] {
  return getStatusQuickActions(status);
}
