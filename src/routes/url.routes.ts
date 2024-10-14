import { Router, Request, Response, NextFunction } from 'express';
import { IUrlController, UrlController } from '../controllers/url.controller';
import { IUrlService, UrlService } from '../services/url.service';
import { IUrlRepository, UrlRepository } from '../repositories/url.repository';
import AuthMiddleware from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';

export class UrlRoutes {
  public router: Router;
  private urlController: IUrlController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.urlController = this.initializeControllers();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeControllers(): IUrlController {
    const urlRepository: IUrlRepository = new UrlRepository();
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);
    const service: IUrlService = new UrlService(urlRepository, userService);
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
      '/url/getAll',
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.wrapAsync(this.urlController.getAllByUser.bind(this.urlController))
    );

    this.router.put(
      '/url/update/:id',
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.wrapAsync(this.urlController.update.bind(this.urlController))
    );
  }

  private wrapAsync(fn: (req: Request, res: Response) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res).catch(next);
    };
  }
}
