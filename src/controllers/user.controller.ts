import { Request, Response } from 'express';
import { IUserService, LoginResponse } from '../services/user.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserDTO } from '../Dtos/user.dto';

export interface IUserController {
  create: (req: Request, res: Response) => Promise<Response>;
  getAll: (req: Request, res: Response) => Promise<Response>;
  getById: (req: Request, res: Response) => Promise<Response>;
  update: (req: Request, res: Response) => Promise<Response>;
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

  async getAll(req: Request, res: Response): Promise<Response> {
    const users = await this.userService.getAll();
    return res.status(200).json({ users });
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const user = await this.userService.getById(Number(id));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const userDto = plainToClass(UserDTO, req.body);
    const errors = await validate(userDto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const updatedUser = await this.userService.update(Number(id), userDto);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Error updating user' });
    }

    return res.status(200).json({ user: updatedUser });
  }
}
