export interface BookItem {
  id: string;
  title: string;
  author: string;
  status: "reading" | "completed" | "want_to_read";
  rating?: number;
  coverImage?: string;
  progress?: number;
}
