export interface UrlAttributes {
  id: number;
  userId?: number;
  originalUrl: string;
  shortenedUrl: string;
  totalAccesses: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
