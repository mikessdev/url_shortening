import { UrlDTO } from '../Dtos/url.dto';
import { UrlAttributes as Url } from '../Interfaces/url.interface';
import { IUrlRepository } from '../repositories/url.repository';
import * as base62 from 'base62-ts';
import crypto from 'crypto';
import { IUserService } from '../services/user.service';

export interface IUrlService {
  createShortUrl: (urlDto: UrlDTO, firebaseId: string) => Promise<Url>;
  getOriginalUrl: (shortId: string) => Promise<string | null>;
  getAll: (firebaseId: string) => Promise<Url[]>;
  update: (id: number, urlDto: UrlDTO) => Promise<number[]>;
  deleteUrl: (id: number) => Promise<Number[]>;
}

export class UrlService implements IUrlService {
  constructor(
    private urlRepository: IUrlRepository,
    private userService: IUserService
  ) {}

  async update(id: number, urlDto: UrlDTO): Promise<number[]> {
    const { originalUrl } = urlDto;

    const urlToUpdate = await this.urlRepository.getById(id);

    if (urlToUpdate?.deletedAt) return [0];

    return await this.urlRepository.update(id, {
      originalUrl,
    });
  }

  async createShortUrl(urlDto: UrlDTO, firebaseId: string): Promise<Url> {
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
        'Unable to shorten the URL at this time. Please try again later.'
      );
    }

    const url = {
      originalUrl,
      shortenedUrl,
    } as Url;

    if (firebaseId) {
      const user = await this.userService.getByFirebaseId(firebaseId);
      if (user) {
        url.userId = user.id;
      } else {
        console.warn(`User with Firebase ID ${firebaseId} not found.`);
      }
    }

    return await this.urlRepository.create(url);
  }

  async getOriginalUrl(shortenedUrl: string): Promise<string | null> {
    const result = await this.urlRepository.findByShortenedUrl(shortenedUrl);

    if (!result) return null;

    const { id, totalAccesses, originalUrl, deletedAt } = result;

    if (deletedAt) return null;

    await this.urlRepository.update(id, { totalAccesses: totalAccesses + 1 });
    return originalUrl;
  }

  async getAll(firebaseId: string): Promise<Url[]> {
    const user = await this.userService.getByFirebaseId(firebaseId);

    if (user) {
      return this.urlRepository.getAllByUserId(user.id);
    }

    return [] as Url[];
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

  async deleteUrl(id: number): Promise<Number[]> {
    return await this.urlRepository.update(id, { deletedAt: new Date() });
  }
}
