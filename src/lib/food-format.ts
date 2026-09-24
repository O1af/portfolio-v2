// Display helpers for the food pages. Client-safe: no data imports.

import { cityName, type Category, type Hours, type Kind } from "./food-core";

export const formatScore = (score: number) => score.toFixed(1);

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const LONG_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const formatMonthYear = (iso: string) => MONTH_YEAR.format(new Date(`${iso}T00:00:00Z`));
export const formatVisitDate = (iso: string) => LONG_DATE.format(new Date(`${iso}T00:00:00Z`));

/** "Coffee" → "coffee", "Coffee & tea" → "coffee & tea" for "Ann Arbor coffee". */
export const lowerLabel = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);

const KIND_OF_PLACE: Record<Category, string> = {
  restaurants: "Restaurant",
  coffee: "Coffee shop",
  dessert: "Dessert",
  bakeries: "Bakery",
  bars: "Bar",
};

export function placeType(category: Category, kind?: Kind, cuisines?: string[]): string {
  if (kind === "tea") return "Tea & boba";
  if (category === "restaurants" && cuisines?.length) return cuisines.slice(0, 2).join(", ");
  return KIND_OF_PLACE[category];
}

/** "Old West Side, Ann Arbor"; just the city when the area is the city. */
export function placeLocation(city: string, area?: string, neighborhood?: string): string {
  const town = cityName(city);
  const local = neighborhood ?? area;
  return local && local !== town ? `${local}, ${town}` : town;
}

// ---------- hours ----------

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Display order, Monday first. */
export const WEEK = [1, 2, 3, 4, 5, 6, 0];

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === 24 || (h === 0 && m === 0)) return "midnight";
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${suffix}`;
}

/** "7am – 6pm", "11am – 3pm, 5 – 9pm", "Open 24 hours", or "Closed". */
export function formatDayHours(hours: Hours[], day: number): string {
  const shifts = hours.filter(([d]) => d === day);
  if (shifts.length === 0) return "Closed";
  if (shifts.some(([, open, close]) => open === "00:00" && close === "24:00")) return "Open 24 hours";
  return shifts.map(([, open, close]) => `${formatTime(open)} – ${formatTime(close)}`).join(", ");
}

// ---------- links ----------

export const directionsUrl = (name: string, placeId?: string, lat?: number, lng?: number) =>
  placeId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export const displayDomain = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const recommendationMailto = (where: string) =>
  `mailto:site@olafdsouza.com?subject=${encodeURIComponent(`Food rec: ${where}`)}`;
