import { UrlService, IUrlService } from '../services/url.service';
import { UrlDTO } from '../Dtos/url.dto';
import { IUrlRepository } from '../repositories/url.repository';
import { UrlAttributes as Url } from '../Interfaces/url.interface';

describe('UrlService', () => {
  let urlService: IUrlService;
  let urlRepositoryMock: IUrlRepository;

  beforeEach(() => {
    urlRepositoryMock = {
      findByShortenedUrl: jest.fn(),
      create: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
    };

    urlService = new UrlService(urlRepositoryMock);
  });

  describe('createShortUrl', () => {
    it('should create a shortened URL successfully', async () => {
      const urlDto: UrlDTO = { originalUrl: 'http://example.com' };
      const shortenedUrl = 'abc123';
      const expectedUrl = {
        originalUrl: urlDto.originalUrl,
        shortenedUrl,
      } as Url;

      jest.spyOn(urlService as any, 'getHash').mockReturnValue(shortenedUrl);
      jest
        .spyOn(urlRepositoryMock, 'findByShortenedUrl')
        .mockResolvedValue(null);
      jest.spyOn(urlRepositoryMock, 'create').mockResolvedValue(expectedUrl);

      const result = await urlService.createShortUrl(urlDto);

      expect(result).toEqual(expectedUrl);
      expect(urlRepositoryMock.create).toHaveBeenCalledWith(expectedUrl);
    });

    it('should throw an error if unable to create a unique shortened URL', async () => {
      const urlDto: UrlDTO = { originalUrl: 'http://example.com' };
      const shortenedUrl = 'abc123';

      jest.spyOn(urlService as any, 'getHash').mockReturnValue(shortenedUrl);
      jest
        .spyOn(urlRepositoryMock, 'findByShortenedUrl')
        .mockResolvedValue({} as Url);

      await expect(urlService.createShortUrl(urlDto)).rejects.toThrow(
        'Não foi possível encurtar o URL no momento, tente novamente mais tarde.'
      );
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL if found', async () => {
      const shortenedUrl = 'abc123';
      const originalUrl = 'http://example.com';
      jest
        .spyOn(urlRepositoryMock, 'findByShortenedUrl')
        .mockResolvedValue({ originalUrl } as Url);

      const result = await urlService.getOriginalUrl(shortenedUrl);

      expect(result).toEqual(originalUrl);
      expect(urlRepositoryMock.findByShortenedUrl).toHaveBeenCalledWith(
        shortenedUrl
      );
    });

    it('should return null if the shortened URL is not found', async () => {
      const shortenedUrl = 'abc123';
      jest
        .spyOn(urlRepositoryMock, 'findByShortenedUrl')
        .mockResolvedValue(null);

      const result = await urlService.getOriginalUrl(shortenedUrl);

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all URLs', async () => {
      const urls = [
        { originalUrl: 'http://example.com', shortenedUrl: 'abc123' },
        { originalUrl: 'http://example2.com', shortenedUrl: 'def456' },
      ] as Url[];
      jest.spyOn(urlRepositoryMock, 'getAll').mockResolvedValue(urls);

      const result = await urlService.getAll();

      expect(result).toEqual(urls);
      expect(urlRepositoryMock.getAll).toHaveBeenCalled();
    });
  });
});
