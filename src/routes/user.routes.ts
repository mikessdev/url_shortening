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
    this.router.post(
      '/',
      this.wrapAsync(this.userController.create.bind(this.userController))
    );

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
