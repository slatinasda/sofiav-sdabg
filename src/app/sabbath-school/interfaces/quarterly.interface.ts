interface Credit {
  name: string;
  value: string;
}

interface Feature {
  image: string;
  title: string;
  description: string;
}

interface QuarterlyGroup {
  name: string;
  order: number;
}

export interface Quarterly {
  title?: string;
  description?: string;
  human_date: string;
  start_date: string; // DD/MM/YYYY format
  end_date: string; // DD/MM/YYYY format
  color_primary: string;
  color_primary_dark: string;
  splash?: string;
  cover?: string;
  credits?: Credit[];
  features?: Feature[];
  lang: string;
  id: string;
  index: string;
  path: string;
  full_path: string;
  introduction?: string;
  quarterly_group?: QuarterlyGroup;
}

interface LessonDay {
  title: string;
  date: string; // DD/MM/YYYY format
  id: string;
  index: string;
  path: string;
  full_path: string;
  read_path: string;
  full_read_path: string;
}

export interface Lesson {
  title: string;
  start_date: string; // DD/MM/YYYY format
  end_date: string; // DD/MM/YYYY format
  id: string;
  index: string;
  path: string;
  full_path: string;
  pdfOnly: boolean;
  cover: string;
}

export interface LessonDetail {
  lesson: Lesson;
  days: LessonDay[];
  pdfs: any[];
}

export interface QuarterlyDetail {
  quarterly: Quarterly;
  lessons: Lesson[];
}

interface BibleTranslation {
  name: string;
  verses: { [key: string]: string };
}

export interface DayRead {
  id: string;
  date: string; // DD/MM/YYYY format
  index: string;
  title: string;
  bible: BibleTranslation[];
  content: string;
}

export interface AudioItem {
  artist: string;
  id: string;
  src: string;
  target: string;
  targetIndex: string;
  image: string;
  imageRatio: string;
  title: string;
  content_type?: string;
}

export interface PublishingInfo {
  data: {
    url?: string;
    message?: string;
  } | null;
}
