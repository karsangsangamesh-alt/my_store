export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  image_url?: string;
  position?: number;
  subcategories?: Category[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  banner_url?: string;
  product_ids?: string[];
}

export interface HeroSlide {
  id: string;
  image_url: string;
  heading?: string;
  subheading?: string;
  cta_text?: string;
  cta_link?: string;
  position?: number;
}