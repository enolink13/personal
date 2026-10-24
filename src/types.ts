export type PostStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

export interface Profile {
  id?: string;
  name: string;
  headline: string;
  short_bio: string;
  full_bio: string;
  avatar_url: string;
  interests: string[];
  principles: string[];
  experiences: {
    period: string;
    role: string;
    organization: string;
    description: string;
  }[];
  social_links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  contact_email: string;
  contact_note: string;
}

export interface SiteSettings {
  id?: string;
  site_title: string;
  tagline: string;
  site_description: string;
  hero_greeting: string;
  hero_title: string;
  hero_subtitle: string;
  hero_bio: string;
  footer_text: string;
  default_og_image: string;
  contact_form_enabled: boolean;
}

export interface MediaItem {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  alt_text: string;
  caption: string;
  description: string;
  doc_date?: string;
  location?: string;
  album_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Album {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featured_media_id?: string;
  supplementary_media_ids: string[];
  status: PostStatus;
  category_id?: string;
  tag_ids: string[];
  published_at?: string;
  scheduled_at?: string;
  meta_title: string;
  meta_description: string;
  image_alt_text?: string;
  read_time_minutes: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostRevision {
  id: string;
  post_id: string;
  title: string;
  body: string;
  excerpt: string;
  saved_by: string;
  note: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  category: string;
  role?: string;
  period?: string;
  summary: string;
  description: string;
  learning_outcomes?: string;
  project_url?: string;
  github_url?: string;
  featured_media_id?: string;
  media_ids: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  featured_media?: { url: string; alt: string } | null;
}

export interface AIGeneratedContent {
  title: string;
  alternative_titles: string[];
  excerpt: string;
  body_markdown: string;
  caption: string;
  suggested_category: string;
  suggested_tags: string[];
  image_alt_text: string;
  slug_suggestion: string;
  meta_title: string;
  meta_description: string;
  needs_context: boolean;
  missing_context?: string[];
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  in_review_posts: number;
  scheduled_posts: number;
  archived_posts: number;
  total_media: number;
  total_portfolios: number;
  total_categories: number;
  total_ai_generations: number;
  unread_messages: number;
}
