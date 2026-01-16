// Individual service or combo
export interface Service {
  id: string;                 // uuid
  slug: string;               // ice-bath-therapy
  title: string;              // Ice Bath Therapy
  type: "single" | "combo";

  mediaUrl: string;           // image URL (from media_url)
  mediaType: "image" | "video";

  ytUrl?: string;             // YouTube URL (only if mediaType === "video")

  description: string;

  durationMinutes: number[];  // [30, 60] for singles, [90] for combos

  benefits: string[];         // bullet points

  price: number;              // discounted / final price
  originalPrice?: number;     // only for combos

  currency: "INR";

  badge?: "POPULAR" | "BEST_VALUE";

  includedServices?: string[]; // ["Ice Bath", "Steam"] for combos

  isActive: boolean;
  createdAt: string;
}
