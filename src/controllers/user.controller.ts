import { Request, Response } from 'express';
import { IUserService, LoginResponse } from '../services/user.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserDTO } from '../Dtos/user.dto';

export interface IUserController {
  create: (req: Request, res: Response) => Promise<Response>;
  login: (req: Request, res: Response) => Promise<Response>;
}

export class UserController implements IUserController {
  constructor(private userService: IUserService) {}

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const userOrErrorMessage = await this.userService.login(email, password);

    if (typeof userOrErrorMessage === 'string') {
      return res.status(400).json({ message: userOrErrorMessage });
    }

    return res.status(201).json({ userOrErrorMessage });
  }

  async create(req: Request, res: Response): Promise<Response> {
    const userDto = plainToClass(UserDTO, req.body);
    const errors = await validate(userDto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const userOrErrorMessage = await this.userService.create(userDto);

    if (typeof userOrErrorMessage === 'string') {
      return res.status(400).json({ message: userOrErrorMessage });
    }

    return res.status(201).json({ userOrErrorMessage });
  }
}
