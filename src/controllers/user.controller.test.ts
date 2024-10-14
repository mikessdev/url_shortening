import { Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { IUserService } from '../services/user.service';
import { validate } from 'class-validator';

jest.mock('../services/user.service');
jest.mock('class-validator');

describe('UserController', () => {
  let userController: UserController;
  let userService: IUserService;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    userService = {
      login: jest.fn(),
      create: jest.fn(),
    } as unknown as IUserService;

    userController = new UserController(userService);
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if login fails', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      (userService.login as jest.Mock).mockResolvedValueOnce(
        'Invalid credentials'
      );

      await userController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return user data on successful login', async () => {
      req.body = { email: 'test@example.com', password: 'correctpassword' };
      const loginResponse = { userId: 1, name: 'Test User' };
      (userService.login as jest.Mock).mockResolvedValueOnce(loginResponse);

      await userController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userOrErrorMessage: loginResponse,
      });
    });
  });

  describe('create', () => {
    it('should return 400 if validation fails', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([
        { message: 'Validation error' },
      ]);

      req.body = { email: 'test@example.com', password: '123456' };

      await userController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array),
      });
    });

    it('should return 400 if user creation fails', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([]);
      req.body = { email: 'test@example.com', password: '123456' };
      (userService.create as jest.Mock).mockResolvedValueOnce(
        'Email already in use'
      );

      await userController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already in use',
      });
    });

    it('should return user data on successful creation', async () => {
      (validate as jest.Mock).mockResolvedValueOnce([]);
      req.body = { email: 'test@example.com', password: '123456' };
      const userResponse = { userId: 1, email: 'test@example.com' };
      (userService.create as jest.Mock).mockResolvedValueOnce(userResponse);

      await userController.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userOrErrorMessage: userResponse,
      });
    });
  });
});
