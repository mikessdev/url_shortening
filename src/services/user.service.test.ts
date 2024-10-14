import { UserService } from './user.service';
import { IUserRepository } from '../repositories/user.repository';
import * as admin from 'firebase-admin';
import { UserDTO } from '../Dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('../repositories/user.repository');
jest.mock('firebase-admin', () => {
  return {
    auth: jest.fn().mockReturnValue({
      createUser: jest.fn(),
    }),
  };
});
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

const mockUserRepository = {
  getByEmail: jest.fn(),
  getByFirebaseId: jest.fn(),
  create: jest.fn(),
};

const firebaseUserMock = {
  uid: 'mockFirebaseId',
  displayName: 'mockUser',
  getIdToken: jest.fn().mockResolvedValue('mockToken'),
};

const userService = new UserService(
  mockUserRepository as unknown as IUserRepository
);

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const userDto: UserDTO = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testUser',
    };

    const mockCreateUser = jest.fn().mockResolvedValue(firebaseUserMock);
    (admin.auth as jest.Mock).mockReturnValue({
      createUser: mockCreateUser,
    });

    (mockUserRepository.create as jest.Mock).mockResolvedValueOnce({
      firebaseId: firebaseUserMock.uid,
      email: userDto.email,
      username: userDto.username,
      password: await bcrypt.hash(userDto.password, 10),
    });

    const result = await userService.create(userDto);

    expect(result).toEqual({
      firebaseId: firebaseUserMock.uid,
      email: userDto.email,
      username: userDto.username,
      password: expect.any(String),
    });
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firebaseId: firebaseUserMock.uid,
        email: userDto.email,
        username: userDto.username,
      })
    );
  });

  it('should login a user successfully', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = { id: 1, email };

    (mockUserRepository.getByEmail as jest.Mock).mockResolvedValueOnce(
      mockUser
    );

    const mockSignInWithEmailAndPassword = jest
      .fn()
      .mockResolvedValue({ user: firebaseUserMock });
    (signInWithEmailAndPassword as jest.Mock).mockImplementation(
      mockSignInWithEmailAndPassword
    );

    const result = await userService.login(email, password);

    expect(result).toEqual({
      user: mockUser,
      token: 'mockToken',
    });
    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith(email);
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      email,
      password
    );
  });

  it('should return "User not found" when user does not exist', async () => {
    const email = 'nonexistent@example.com';
    const password = 'password123';

    (mockUserRepository.getByEmail as jest.Mock).mockResolvedValueOnce(null);

    const result = await userService.login(email, password);

    expect(result).toBe('User not found');
  });

  it('should return error message on login failure', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = { id: 1, email };

    (mockUserRepository.getByEmail as jest.Mock).mockResolvedValueOnce(
      mockUser
    );
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'Wrong password',
    });

    const result = await userService.login(email, password);

    expect(result).toBe('Wrong password');
  });

  it('should get user by Firebase ID', async () => {
    const firebaseId = 'mockFirebaseId';
    const mockUser = { id: 1, email: 'test@example.com' };

    (mockUserRepository.getByFirebaseId as jest.Mock).mockResolvedValueOnce(
      mockUser
    );

    const result = await userService.getByFirebaseId(firebaseId);

    expect(result).toEqual(mockUser);
    expect(mockUserRepository.getByFirebaseId).toHaveBeenCalledWith(firebaseId);
  });

  it('should return null if no user found by Firebase ID', async () => {
    const firebaseId = 'mockFirebaseId';

    (mockUserRepository.getByFirebaseId as jest.Mock).mockResolvedValueOnce(
      null
    );

    const result = await userService.getByFirebaseId(firebaseId);

    expect(result).toBeNull();
  });
});
