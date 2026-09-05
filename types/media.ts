export interface MediaItem {
  id: string;
  title: string;
  type: "movie" | "tv" | "anime";
  status: "watching" | "completed" | "plan_to_watch";
  rating?: number;
}
