import { UrlService } from '../services/url.service';
import { IUrlRepository } from '../repositories/url.repository';
import { IUserService } from '../services/user.service';
import { UrlDTO } from '../Dtos/url.dto';
import { UrlAttributes as Url } from '../Interfaces/url.interface';

jest.mock('base62-ts');
jest.mock('crypto');

describe('UrlService', () => {
  let urlService: UrlService;
  let urlRepository: IUrlRepository;
  let userService: IUserService;

  beforeEach(() => {
    urlRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByShortenedUrl: jest.fn(),
      getAllByUserId: jest.fn(),
      getById: jest.fn(),
    } as unknown as IUrlRepository;

    userService = {
      getByFirebaseId: jest.fn(),
    } as unknown as IUserService;

    urlService = new UrlService(urlRepository, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('should create a short URL and return it', async () => {
      const urlDto: UrlDTO = { originalUrl: 'http://example.com' };
      const firebaseId = 'firebase-id';
      const userId = 1;
      const shortenedUrl = 'abc123';
      const url = {
        originalUrl: urlDto.originalUrl,
        shortenedUrl,
        userId,
      } as Url;

      (urlRepository.findByShortenedUrl as jest.Mock).mockResolvedValueOnce(
        null
      );
      (userService.getByFirebaseId as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (urlRepository.create as jest.Mock).mockResolvedValueOnce(url);

      jest.spyOn(urlService as any, 'getHash').mockReturnValue(shortenedUrl);

      const result = await urlService.createShortUrl(urlDto, firebaseId);

      expect(urlRepository.findByShortenedUrl).toHaveBeenCalledWith(
        shortenedUrl
      );
      expect(urlRepository.create).toHaveBeenCalledWith(url);
      expect(result).toEqual(url);
    });

    it('should throw an error if unable to create a unique short URL', async () => {
      const urlDto: UrlDTO = { originalUrl: 'http://example.com' };
      const firebaseId = 'firebase-id';

      (urlRepository.findByShortenedUrl as jest.Mock).mockResolvedValueOnce({});

      await expect(
        urlService.createShortUrl(urlDto, firebaseId)
      ).rejects.toThrow();
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL if it exists', async () => {
      const shortenedUrl = 'abc123';
      const originalUrl = 'http://example.com';
      const urlData = {
        id: 1,
        originalUrl,
        totalAccesses: 0,
        deletedAt: null,
      } as Url;

      (urlRepository.findByShortenedUrl as jest.Mock).mockResolvedValueOnce(
        urlData
      );
      (urlRepository.update as jest.Mock).mockResolvedValueOnce([1]);

      const result = await urlService.getOriginalUrl(shortenedUrl);

      expect(urlRepository.findByShortenedUrl).toHaveBeenCalledWith(
        shortenedUrl
      );
      expect(urlRepository.update).toHaveBeenCalledWith(1, {
        totalAccesses: 1,
      });
      expect(result).toBe(originalUrl);
    });

    it('should return null if the shortened URL does not exist', async () => {
      const shortenedUrl = 'abc123';

      (urlRepository.findByShortenedUrl as jest.Mock).mockResolvedValueOnce(
        null
      );

      const result = await urlService.getOriginalUrl(shortenedUrl);

      expect(result).toBeNull();
    });

    it('should return null if the URL is deleted', async () => {
      const shortenedUrl = 'abc123';
      const urlData = {
        id: 1,
        originalUrl: 'http://example.com',
        deletedAt: new Date(),
      } as Url;

      (urlRepository.findByShortenedUrl as jest.Mock).mockResolvedValueOnce(
        urlData
      );

      const result = await urlService.getOriginalUrl(shortenedUrl);

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all URLs for the user', async () => {
      const firebaseId = 'firebase-id';
      const userId = 1;
      const urls = [
        { originalUrl: 'http://example.com', shortenedUrl: 'abc123', userId },
      ] as Url[];

      (userService.getByFirebaseId as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (urlRepository.getAllByUserId as jest.Mock).mockResolvedValueOnce(urls);

      const result = await urlService.getAll(firebaseId);

      expect(userService.getByFirebaseId).toHaveBeenCalledWith(firebaseId);
      expect(urlRepository.getAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(urls);
    });

    it('should return an empty array if the user does not exist', async () => {
      const firebaseId = 'firebase-id';

      (userService.getByFirebaseId as jest.Mock).mockResolvedValueOnce(null);

      const result = await urlService.getAll(firebaseId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update the URL if it exists and is not deleted', async () => {
      const id = 1;
      const urlDto: UrlDTO = { originalUrl: 'http://newexample.com' };
      const urlData = { id, deletedAt: null } as Url;

      (urlRepository.getById as jest.Mock).mockResolvedValueOnce(urlData);
      (urlRepository.update as jest.Mock).mockResolvedValueOnce([1]);

      const result = await urlService.update(id, urlDto);

      expect(urlRepository.getById).toHaveBeenCalledWith(id);
      expect(urlRepository.update).toHaveBeenCalledWith(id, {
        originalUrl: urlDto.originalUrl,
      });
      expect(result).toEqual([1]);
    });

    it('should return [0] if the URL is deleted', async () => {
      const id = 1;
      const urlData = { id, deletedAt: new Date() } as Url;

      (urlRepository.getById as jest.Mock).mockResolvedValueOnce(urlData);

      const result = await urlService.update(id, {
        originalUrl: 'http://example.com',
      });

      expect(result).toEqual([0]);
    });
  });
});
