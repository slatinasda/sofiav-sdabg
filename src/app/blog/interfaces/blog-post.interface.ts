export interface BlogPostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  author: string;
  cover?: string;
}

export interface BlogPost extends BlogPostSummary {
  contentHtml: string;
}
