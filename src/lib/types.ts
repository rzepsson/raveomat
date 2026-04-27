export type EventGenre = "techno" | "house" | "dnb" | "trance" | "hard_techno" | "minimal" | "tech_house" | "other";
export type EventType = "club" | "festival" | "outdoor" | "private" | "stream";
export type EventStatus = "draft" | "available" | "soldout" | "cancelled" | "completed";
export type PromoTier = "none" | "basic" | "pro";
export type OAuthProvider = "google" | "apple";

export type UserRole = "super_admin" | "admin" | "promoter" | "user";
export type OrgMemberRole = "owner" | "admin" | "member";
export type OrgType = "club" | "collective" | "festival_organizer" | "promoter" | "venue" | "other";
export type OrgStatus = "active" | "suspended" | "pending" | "archived";
export type TicketStatus = "valid" | "used" | "cancelled" | "expired" | "refunded";
export type OrderStatus = "pending" | "completed" | "failed" | "refunded" | "partially_refunded";
export type PaymentMethod = "card" | "blik" | "transfer" | "google_pay" | "apple_pay";
export type TicketScanResult = "valid" | "already_used" | "invalid" | "wrong_event";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  city: string | null;
  locale: string;
  email_verified: boolean;
  phone_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  city: string | null;
  address: string | null;
  type: OrgType;
  status: OrgStatus;
  is_verified: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_soundcloud: string | null;
  tpay_merchant_id: string | null;
  tpay_security_code: string | null;
  invite_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  status: EventStatus;
  promo_tier?: PromoTier;
  genre?: EventGenre;
  type?: EventType;
  image_url?: string;
  description?: string;
  total_tickets?: number;
  sold_tickets?: number;
  organization_id?: string;
  organizations?: { name: string };
}

export interface TicketEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  status: EventStatus;
  genre?: EventGenre;
  type?: EventType;
  imageUrl?: string;
  promo_tier?: PromoTier;
}

export interface ProEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  venue: string;
  price: number;
  image_url?: string;
}

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  status: EventStatus;
  genre?: EventGenre;
  type?: EventType;
  image_url?: string;
  description?: string;
  total_tickets?: number;
  sold_tickets?: number;
  organizations?: { name: string };
}

export interface ManagedEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  genre: EventGenre;
  type: EventType;
  description: string;
  imageUrl: string;
  status: EventStatus;
  organizationId: string;
}

export interface EventPricingTier {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  sale_start: string | null;
  sale_end: string | null;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  event_id: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  tpay_transaction_id: string | null;
  tpay_crc: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  pricing_tier_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Ticket {
  id: string;
  order_id: string;
  event_id: string;
  user_id: string;
  pricing_tier_id: string;
  qr_code: string;
  status: TicketStatus;
  checked_in_at: string | null;
  created_at: string;
}

export interface TicketScan {
  id: string;
  ticket_id: string;
  event_id: string;
  scanned_by: string;
  result: TicketScanResult;
  scanned_at: string;
}

export interface Refund {
  id: string;
  order_id: string;
  amount: number;
  reason: string | null;
  status: OrderStatus;
  tpay_refund_id: string | null;
  created_at: string;
  updated_at: string;
}

export const GENRE_OPTIONS: EventGenre[] = ["techno", "house", "dnb", "trance", "hard_techno", "minimal", "tech_house", "other"];
export const TYPE_OPTIONS: EventType[] = ["club", "festival", "outdoor", "private", "stream"];

export const GENRE_LABELS: Record<string, string> = {
  techno: "Techno",
  house: "House",
  dnb: "DnB",
  trance: "Trance",
  hard_techno: "Hard Techno",
  minimal: "Minimal",
  tech_house: "Tech House",
  other: "Inne",
};

export const TYPE_LABELS: Record<string, string> = {
  club: "Club",
  festival: "Festival",
  outdoor: "Outdoor",
  private: "Private",
  stream: "Stream",
};

export const DEFAULT_GENRE: EventGenre = "techno";
export const DEFAULT_TYPE: EventType = "club";
export const DEFAULT_STATUS: EventStatus = "draft";
export const MAX_TICKETS_PER_PURCHASE = 4;
export const CROP_CONTAINER_WIDTH = 400;
export const CROP_OUTPUT_WIDTH = 800;
export const CROP_ASPECT_RATIO = 4 / 3;
