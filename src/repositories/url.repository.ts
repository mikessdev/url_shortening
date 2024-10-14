import { UrlAttributes as Url } from '../Interfaces/url.interface';
import { Url as UrlModel } from '../models/url.model';

export interface IUrlRepository {
  create: (url: Url) => Promise<Url>;
  update: (urlId: number, url: Partial<Url>) => Promise<number[]>;
  findByShortenedUrl: (shortenedUrl: string) => Promise<Url | null>;
  getAllByUserId: (userId: number) => Promise<Url[]>;
  getById: (id: number) => Promise<Url | null>;
}

export class UrlRepository implements IUrlRepository {
  private readonly urlModel = UrlModel;

  async getById(id: number): Promise<Url | null> {
    try {
      return await this.urlModel.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error('Error finding URL by ID:', error);
      return null;
    }
  }
  async create(url: Url): Promise<Url> {
    try {
      return await this.urlModel.create(url);
    } catch (error) {
      console.error('Error creating URL:', error);
      throw new Error('Error creating URL');
    }
  }

  async update(urlId: number, url: Partial<Url>): Promise<number[]> {
    try {
      const result = await this.urlModel.update(url, {
        where: { id: urlId },
      });

      return result;
    } catch (error) {
      console.error('Error updating URL:', error);
      throw new Error('Error updating URL');
    }
  }

  async findByShortenedUrl(shortenedUrl: string): Promise<Url | null> {
    try {
      return await this.urlModel.findOne({
        where: {
          shortenedUrl,
        },
      });
    } catch (error) {
      console.error('Error finding URL by shortened URL:', error);
      return null;
    }
  }

  async getAllByUserId(userId: number): Promise<Url[]> {
    try {
      return await this.urlModel.findAll({
        where: {
          userId,
        },
      });
    } catch (error) {
      console.error('Error fetching all URLs for the user:', error);
      return [];
    }
  }
}
