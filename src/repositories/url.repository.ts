import { UrlAttributes as Url } from '../Interfaces/url.interface';
import { Url as UrlModel } from '../models/url.model';

export interface IUrlRepository {
  create: (url: Url) => Promise<Url>;
  update: (urlId: number, url: Partial<Url>) => Promise<number[]>;
  findByShortenedUrl: (shortenedUrl: string) => Promise<Url | null>;
  getAll: () => Promise<Url[]>;
}

export class UrlRepository implements IUrlRepository {
  private readonly urlModel = UrlModel;

  async create(url: Url): Promise<Url> {
    try {
      return await this.urlModel.create(url);
    } catch (error) {
      console.error('Erro ao criar URL:', error);
      throw new Error('Erro ao criar URL');
    }
  }

  async update(urlId: number, url: Partial<Url>): Promise<number[]> {
    try {
      const result = await this.urlModel.update(url, {
        where: { id: urlId },
      });

      return result;
    } catch (error) {
      console.error('Erro ao atualizar URL:', error);
      throw new Error('Erro ao atualizar URL');
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
      console.error('Erro ao buscar URL pelo original:', error);
      return null;
    }
  }

  async getAll(): Promise<Url[]> {
    try {
      return await this.urlModel.findAll();
    } catch (error) {
      console.error('Erro ao buscar todas as URLs:', error);
      return [];
    }
  }
}
