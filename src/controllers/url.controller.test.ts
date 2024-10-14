import { Request, Response } from 'express';
import { UrlController } from '../controllers/url.controller';
import { IUrlService } from '../services/url.service';
import { validate } from 'class-validator';

jest.mock('../middlewares/auth.middleware', () => {
  return jest.fn().mockImplementation(() => {
    return {
      firebase: {
        auth: () => ({
          verifyIdToken: jest.fn().mockResolvedValue({ uid: 'firebase_id' }),
        }),
      },
    };
  });
});

jest.mock('class-validator');
jest.mock('class-transformer');

describe('UrlController', () => {
  let urlController: UrlController;
  let urlService: IUrlService;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    urlService = {
      createShortUrl: jest.fn(),
      getOriginalUrl: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
    } as unknown as IUrlService;

    urlController = new UrlController(urlService);
    req = {
      params: {},
      body: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should return 400 if validation fails', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([
        { message: 'Validation error' },
      ]);

      req.params = { id: '1' };
      req.body = { originalUrl: '' };

      await urlController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
    });

    it('should update URL and return 200', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([]);
      req.params = { id: '1' };
      req.body = { originalUrl: 'https://example.com' };

      urlService.update = jest
        .fn()
        .mockResolvedValueOnce({ id: 1, originalUrl: 'https://example.com' });

      await urlController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updatedUrl: { id: 1, originalUrl: 'https://example.com' },
      });
    });

    it('should return 500 if update fails', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([]);
      req.params = { id: '1' };
      req.body = { originalUrl: 'https://example.com' };

      urlService.update = jest.fn().mockResolvedValueOnce(null);

      await urlController.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating URL' });
    });
  });

  describe('shortenUrl', () => {
    it('should return 400 if validation fails', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([
        { message: 'Validation error' },
      ]);

      req.body = { originalUrl: '' };

      await urlController.shortenUrl(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
    });

    it('should create short URL and return 201', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([]);
      req.body = { originalUrl: 'https://example.com' };
      req.headers = { authorization: 'Bearer some_token' };

      const firebaseId = 'firebase_id';
      (urlService.createShortUrl as jest.Mock).mockResolvedValueOnce(
        'short_url'
      );

      await urlController.shortenUrl(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ shortUrl: 'short_url' });
    });

    it('should return 500 if creating short URL fails', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([]);
      req.body = { originalUrl: 'https://example.com' };
      req.headers = { authorization: 'Bearer some_token' };

      (urlService.createShortUrl as jest.Mock).mockResolvedValueOnce(null);

      await urlController.shortenUrl(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error shortening the URL',
      });
    });
  });

  describe('redirectUrl', () => {
    it('should redirect to the original URL', async () => {
      req.params = { shortId: 'short_id' };
      urlService.getOriginalUrl = jest
        .fn()
        .mockResolvedValueOnce('https://original.com');

      await urlController.redirectUrl(req as Request, res as Response);

      expect(res.redirect).toHaveBeenCalledWith('https://original.com');
    });

    it('should return 404 if URL not found', async () => {
      req.params = { shortId: 'short_id' };
      urlService.getOriginalUrl = jest.fn().mockResolvedValueOnce(null);

      await urlController.redirectUrl(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'URL not found' });
    });
  });

  describe('getAllByUser', () => {
    it('should return 403 if user is not found', async () => {
      req.headers = { authorization: 'Bearer some_token' };
      urlService.getAll = jest.fn().mockResolvedValueOnce([]);

      await urlController.getAllByUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ result: [] });
    });

    it('should return all URLs for the user', async () => {
      req.headers = { authorization: 'Bearer some_token' };
      urlService.getAll = jest.fn().mockResolvedValueOnce(['url1', 'url2']);

      await urlController.getAllByUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ result: ['url1', 'url2'] });
    });
  });
});
