import { Request, Response } from 'express';
import { IUrlService } from '../services/url.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UrlDTO } from '../Dtos/url.dto';
import AuthMiddleware from '../middlewares/auth.middleware';

export interface IUrlController {
  shortenUrl: (req: Request, res: Response) => Promise<Response>;
  redirectUrl: (req: Request, res: Response) => Promise<Response | void>;
  getAll: (req: Request, res: Response) => Promise<Response | void>;
  update: (req: Request, res: Response) => Promise<Response | void>;
}

export class UrlController implements IUrlController {
  private authProvider: AuthMiddleware;

  constructor(private urlService: IUrlService) {
    this.authProvider = new AuthMiddleware();
  }

  async update(req: Request, res: Response): Promise<Response | void> {
    const { id } = req.params;
    const urlDto = plainToClass(UrlDTO, req.body);

    const errors = await validate(urlDto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const updatedUrl = await this.urlService.update(Number(id), urlDto);

    if (!updatedUrl) {
      return res.status(500).json({ message: 'Error updating URL' });
    }

    return res.status(200).json({ url: updatedUrl });
  }

  async shortenUrl(req: Request, res: Response): Promise<Response> {
    const { authorization } = req.headers;
    const urlDto = plainToClass(UrlDTO, {
      originalUrl: req.body.originalUrl,
    });
    const errors = await validate(urlDto);
    let firebaseId: string = '';

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (!!authorization) {
      try {
        const userCredential = await this.authProvider.firebase
          .auth()
          .verifyIdToken(authorization.replace('Bearer ', ''));

        firebaseId = userCredential.uid;
      } catch (error) {
        return res.status(403).json({ message: 'User not found' });
      }
    }

    const shortUrl = await this.urlService.createShortUrl(urlDto, firebaseId);

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
