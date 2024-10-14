import { Router, Request, Response, NextFunction } from 'express';
import {
  IUserController,
  UserController,
} from '../controllers/user.controller';
import { IUserService, UserService } from '../services/user.service';
import {
  IUserRepository,
  UserRepository,
} from '../repositories/user.repository';

export class UserRoutes {
  public router: Router;
  private userController: IUserController;

  constructor() {
    this.router = Router();
    this.userController = this.initializeControllers();
    this.initializeRoutes();
  }

  private initializeControllers(): IUserController {
    const repository: IUserRepository = new UserRepository();
    const service: IUserService = new UserService(repository);
    return new UserController(service);
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /user:
     *   post:
     *     summary: Create a new user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               username:
     *                 type: string
     *     responses:
     *       201:
     *         description: User created successfully
     *       400:
     *         description: Bad request
     *       500:
     *         description: An unexpected error occurred
     */
    this.router.post(
      '/',
      this.wrapAsync(this.userController.create.bind(this.userController))
    );

    /**
     * @swagger
     * /user/login:
     *   post:
     *     summary: User login
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: User logged in successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   type: object
     *                 token:
     *                   type: string
     *       401:
     *         description: Invalid credentials
     *       404:
     *         description: User not found
     *       500:
     *         description: An unexpected error occurred
     */
    this.router.post(
      '/login',
      this.wrapAsync(this.userController.login.bind(this.userController))
    );
  }

  private wrapAsync(fn: (req: Request, res: Response) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res).catch(next);
    };
  }
}
