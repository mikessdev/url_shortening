import { Request, Response } from 'express';
import { IUrlService } from '../services/url.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UrlDTO } from '../Dtos/url.dto';

export interface IUrlController {
  shortenUrl: (req: Request, res: Response) => Promise<Response>;
  redirectUrl: (req: Request, res: Response) => Promise<Response | void>;
  getAll: (req: Request, res: Response) => Promise<Response | void>;
}

export class UrlController implements IUrlController {
  constructor(private urlService: IUrlService) {}

  async shortenUrl(req: Request, res: Response): Promise<Response> {
    const urlDto = plainToClass(UrlDTO, {
      originalUrl: req.body.originalUrl,
    });

    const errors = await validate(urlDto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const shortUrl = await this.urlService.createShortUrl(urlDto);

    if (!shortUrl) {
      return res.status(500).json({ message: 'Error shortening the URL' });
    }

    return res.status(201).json({ shortUrl });
  }

  async redirectUrl(req: Request, res: Response): Promise<Response | void> {
    const { shortId } = req.params;

    const originalUrl = await this.urlService.getOriginalUrl(shortId);
    if (originalUrl) {
      return res.redirect(originalUrl);
    }

    return res.status(404).json({ message: 'URL not found' });
  }

  async getAll(req: Request, res: Response): Promise<Response | void> {
    const result = await this.urlService.getAll();
    return res.status(201).json({ result });
  }
}
