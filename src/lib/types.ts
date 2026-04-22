export type EventGenre = "techno" | "house" | "dnb" | "trance";
export type EventType = "club" | "festival" | "outdoor";
export type EventStatus = "available" | "soldout" | "draft";
export type PromoTier = "pro" | "basic" | "none";
export type OAuthProvider = "google" | "apple";

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

export const GENRE_OPTIONS: EventGenre[] = ["techno", "house", "dnb", "trance"];
export const TYPE_OPTIONS: EventType[] = ["club", "festival", "outdoor"];

export const GENRE_LABELS: Record<string, string> = {
  techno: "Techno",
  house: "House",
  dnb: "DnB",
  trance: "Trance",
};

export const TYPE_LABELS: Record<string, string> = {
  club: "Club",
  festival: "Festival",
  outdoor: "Outdoor",
};

export const DEFAULT_GENRE: EventGenre = "techno";
export const DEFAULT_TYPE: EventType = "club";
export const DEFAULT_STATUS: EventStatus = "available";
export const MAX_TICKETS_PER_PURCHASE = 4;
export const CROP_CONTAINER_WIDTH = 400;
export const CROP_OUTPUT_WIDTH = 800;
export const CROP_ASPECT_RATIO = 4 / 3;
