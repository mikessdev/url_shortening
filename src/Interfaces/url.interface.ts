export interface UrlAttributes {
  id: number;
  originalUrl: string;
  shortenedUrl: string;
  totalAccesses: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
