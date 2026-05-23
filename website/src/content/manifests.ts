import { homeManifest } from './home.manifest';
import { quickstartManifest } from './quickstart.manifest';
import { howToManifest } from './how-to.manifest';
import { advancedManifest } from './advanced.manifest';
import { faqManifest } from './faq.manifest';
import { conceptsManifest } from './concepts.manifest';
import { featuresManifest } from './features.manifest';

export const websiteContentManifests = [
  homeManifest,
  quickstartManifest,
  howToManifest,
  advancedManifest,
  faqManifest,
  conceptsManifest,
  featuresManifest,
] as const;
