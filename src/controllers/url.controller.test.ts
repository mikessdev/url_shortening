import { UrlController, IUrlController } from '../controllers/url.controller';
import { IUrlService } from '../services/url.service';
import { Request, Response } from 'express';

describe('UrlController', () => {
  let urlController: IUrlController;
  let urlServiceMock: IUrlService;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    urlServiceMock = {
      createShortUrl: jest.fn(),
      getOriginalUrl: jest.fn(),
      getAll: jest.fn(),
    };

    urlController = new UrlController(urlServiceMock);

    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
  });

  describe('shortenUrl', () => {
    it('should return 400 if validation fails', async () => {
      req.body = { originalUrl: '' };

      const result = await urlController.shortenUrl(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
    });

    it('should return 201 and the shortened URL on success', async () => {
      req.body = { originalUrl: 'http://example.com' };
      const shortUrl = { shortenedUrl: 'abc123' };

      (urlServiceMock.createShortUrl as jest.Mock).mockResolvedValue(shortUrl);

      const result = await urlController.shortenUrl(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ shortUrl });
    });

    it('should return 500 if service returns null', async () => {
      req.body = { originalUrl: 'http://example.com' };

      (urlServiceMock.createShortUrl as jest.Mock).mockResolvedValue(null);

      const result = await urlController.shortenUrl(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error shortening the URL',
      });
    });
  });

  describe('redirectUrl', () => {
    it('should redirect to the original URL if found', async () => {
      req.params = { shortId: 'abc123' };
      const originalUrl = 'http://example.com';

      (urlServiceMock.getOriginalUrl as jest.Mock).mockResolvedValue(
        originalUrl
      );

      const result = await urlController.redirectUrl(
        req as Request,
        res as Response
      );

      expect(res.redirect).toHaveBeenCalledWith(originalUrl);
    });

    it('should return 404 if the original URL is not found', async () => {
      req.params = { shortId: 'abc123' };

      (urlServiceMock.getOriginalUrl as jest.Mock).mockResolvedValue(null);

      const result = await urlController.redirectUrl(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'URL not found' });
    });
  });

  describe('getAll', () => {
    it('should return 201 and all URLs', async () => {
      const urls = [
        { originalUrl: 'http://example.com', shortenedUrl: 'abc123' },
        { originalUrl: 'http://example2.com', shortenedUrl: 'def456' },
      ];

      (urlServiceMock.getAll as jest.Mock).mockResolvedValue(urls);

      const result = await urlController.getAll(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ result: urls });
    });
  });
});
