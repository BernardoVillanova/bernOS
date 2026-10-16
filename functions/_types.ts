export interface Env {
  DB?: D1Database;
  GITHUB_USER?: string;
}

export interface TerraformResource {
  id: number;
  service_name: string;
  resource_key: string;
  aws_category: string;
  icon_color: string;
  is_pro: number;
  curiosity_title: string;
  curiosity_content: string;
  display_order: number;
  column_position: number;
}

export interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  homepage: string;
  topics: string[];
  updated_at: string;
  created_at: string;
  is_favorite: boolean;
  folder: string | null;
}
