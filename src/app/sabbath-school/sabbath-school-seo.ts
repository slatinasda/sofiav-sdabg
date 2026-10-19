import { OG_IMAGE_ALT, OG_IMAGES, PageMeta } from '../shared/services/seo.service';

export const SABBATH_SCHOOL_OG_IMAGE = OG_IMAGES.sabbathSchool;

export const SABBATH_SCHOOL_KEYWORDS = [
  'съботен урок',
  'съботно училище',
  'групова дискусия',
  'изучаване на Библията',
  'адвентни уроци',
];

export const SABBATH_SCHOOL_PAGE_META: PageMeta = {
  title: 'Съботен урок',
  socialTitle: 'Съботен урок: изучаване на Библията',
  description:
    'Тримесечни уроци за групови дискусии. Изучавайте Библията заедно с нас всяка събота.',
  path: 'sabbath-school',
  image: SABBATH_SCHOOL_OG_IMAGE,
  imageAlt: OG_IMAGE_ALT,
  keywords: SABBATH_SCHOOL_KEYWORDS,
};
