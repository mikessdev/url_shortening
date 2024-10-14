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
    /**
     * @swagger
     * /:
     *   post:
     *     summary: Create shorten a URL
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               originalUrl:
     *                 type: string
     *     responses:
     *       201:
     *         description: URL shortened successfully
     *       400:
     *         description: Bad request
     *       500:
     *         description: An unexpected error occurred
     */
    this.router.post(
      '/',
      this.wrapAsync(this.urlController.shortenUrl.bind(this.urlController))
    );

    /**
     * @swagger
     * /{shortId}:
     *   get:
     *     summary: Redirect to the long URL
     *     parameters:
     *       - in: path
     *         name: shortId
     *         required: true
     *         description: The short ID of the URL
     *         schema:
     *           type: string
     *     responses:
     *       302:
     *         description: Redirects to the long URL
     *       404:
     *         description: URL not found
     *       500:
     *         description: An unexpected error occurred
     */
    this.router.get(
      '/:shortId',
      this.wrapAsync(this.urlController.redirectUrl.bind(this.urlController))
    );

    /**
     * @swagger
     * /url/getAll:
     *   get:
     *     summary: Get all URLs for a user
     *     tags: [URL]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of URLs
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: An unexpected error occurred
     */
    this.router.get(
      '/url/getAll',
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.wrapAsync(this.urlController.getAllByUser.bind(this.urlController))
    );

    /**
     * @swagger
     *
     * /url/update/{id}:
     *   put:
     *     summary: Update a URL
     *     tags: [URL]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the URL to update
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               originalUrl:
     *                 type: string
     *     responses:
     *       200:
     *         description: URL updated successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: URL not found
     *       500:
     *         description: An unexpected error occurred
     */
    this.router.put(
      '/url/update/:id',
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.wrapAsync(this.urlController.update.bind(this.urlController))
    );

    /**
     * @swagger
     * /url/delete/{id}:
     *   delete:
     *     summary: Delete a URL
     *     tags: [URL]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the URL to delete
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: URL deleted successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: URL not found
     *       500:
     *         description: An unexpected error occurred
     */

    this.router.delete(
      '/url/delete/:id',
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.wrapAsync(this.urlController.delete.bind(this.urlController))
    );
  }

  private wrapAsync(fn: (req: Request, res: Response) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res).catch(next);
    };
  }
}
