export interface Book {
  title: string;
  cover: string;
  progressLabel: string;
  progressPercent: number;
  status?: "reading" | "completed";
}
