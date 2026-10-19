import { OG_IMAGE_ALT, OG_IMAGES, PageMeta } from '../shared/services/seo.service';

export interface DoctrineSeo {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
}

const DOCTRINE_KEYWORDS = ['адвентни вярвания', 'библейски учения'];

export function doctrinePageMeta(doctrine: DoctrineSeo): PageMeta {
  return {
    title: doctrine.title,
    socialTitle: `${doctrine.title}: библейското учение`,
    description: doctrine.description,
    path: `beliefs/${doctrine.slug}`,
    image: OG_IMAGES.beliefs,
    imageAlt: OG_IMAGE_ALT,
    keywords: [...doctrine.keywords, ...DOCTRINE_KEYWORDS],
  };
}
