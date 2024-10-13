import { Router, Request, Response, NextFunction } from 'express';
import { IUrlController, UrlController } from '../controllers/url.controller';
import { IUrlService, UrlService } from '../services/url.service';
import { IUrlRepository, UrlRepository } from '../repositories/url.repository';

export class UrlRoutes {
  public router: Router;
  private urlController: IUrlController;

  constructor() {
    this.router = Router();
    this.urlController = this.initializeControllers();
    this.initializeRoutes();
  }

  private initializeControllers(): IUrlController {
    const repository: IUrlRepository = new UrlRepository();
    const service: IUrlService = new UrlService(repository);
    return new UrlController(service);
  }

  private initializeRoutes(): void {
    this.router.post(
      '/',
      this.wrapAsync(this.urlController.shortenUrl.bind(this.urlController))
    );
    this.router.get(
      '/:shortId',
      this.wrapAsync(this.urlController.redirectUrl.bind(this.urlController))
    );
    this.router.get(
      '/',
      this.wrapAsync(this.urlController.getAll.bind(this.urlController))
    );
  }

  private defaultRoute(req: Request, res: Response): void {
    res.send('Hello World!');
  }

  private wrapAsync(fn: (req: Request, res: Response) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res).catch(next);
    };
  }
}
