export type Business = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  google_review_url: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
};

// Columns that make up a Business, for .select() calls.
export const BUSINESS_COLUMNS =
  "id, slug, name, logo_url, category, google_review_url, whatsapp_number, instagram_url, facebook_url";

export type Scan = {
  id: string;
  business_id: string;
  rating: number;
  comment_raw: string | null;
  draft_text: string | null;
  created_at: string;
};
