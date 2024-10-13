import { UrlDTO } from '../Dtos/url.dto';
import { UrlAttributes as Url } from '../Interfaces/url.interface';
import { IUrlRepository } from '../repositories/url.repository';
import * as base62 from 'base62-ts';
import crypto from 'crypto';

export interface IUrlService {
  createShortUrl: (urlDto: UrlDTO) => Promise<Url>;
  getOriginalUrl: (shortId: string) => Promise<string | null>;
  getAll: () => Promise<Url[]>;
  update: (id: number, urlDto: UrlDTO) => Promise<number[]>;
}

export class UrlService implements IUrlService {
  constructor(private urlRepository: IUrlRepository) {}

  async update(id: number, urlDto: UrlDTO): Promise<number[]> {
    const { originalUrl } = urlDto;

    const result = await this.urlRepository.update(id, {
      originalUrl,
    });

    return result;
  }

  async createShortUrl(urlDto: UrlDTO): Promise<Url> {
    const { originalUrl } = urlDto;

    let shortenedUrl: string;
    let existingUrl: Url | null;
    const maxAttempts = 10;
    let attempts = 0;

    do {
      shortenedUrl = this.getHash(originalUrl);
      existingUrl = await this.urlRepository.findByShortenedUrl(shortenedUrl);

      attempts++;
    } while (existingUrl && attempts < maxAttempts);

    if (existingUrl) {
      throw new Error(
        'Não foi possível encurtar o URL no momento, tente novamente mais tarde.'
      );
    }

    const url = {
      originalUrl,
      shortenedUrl,
    } as Url;

    const result = await this.urlRepository.create(url);

    return result;
  }

  async getOriginalUrl(shortenedUrl: string): Promise<string | null> {
    const result = await this.urlRepository.findByShortenedUrl(shortenedUrl);

    if (!result) return null;

    const { id, totalAccesses, originalUrl, deletedAt } = result;

    if (deletedAt) return null;

    await this.urlRepository.update(id, { totalAccesses: totalAccesses + 1 });
    return originalUrl;
  }

  async getAll(): Promise<Url[]> {
    return this.urlRepository.getAll();
  }

  private getHash(originalUrl: string): string {
    const salt = this.generateRandomSalt();
    const hash = crypto
      .createHash('sha256')
      .update(originalUrl + salt)
      .digest('hex');
    const shortUrl = base62.encode(parseInt(hash.slice(0, 12), 16)).slice(0, 6);
    return shortUrl;
  }

  private generateRandomSalt(): string {
    return crypto.randomBytes(4).toString('hex');
  }
}
