import { UserAttributes as User } from '../Interfaces/user.interface';
import { IUserRepository } from '../repositories/user.repository';
import * as admin from 'firebase-admin';
import { UserDTO } from '../Dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface IUserService {
  create: (user: UserDTO) => Promise<User | string>;
  login: (email: string, password: string) => Promise<LoginResponse | string>;
  getByFirebaseId: (firebaseId: string) => Promise<User | null>;
}

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getByFirebaseId(firebaseId: string): Promise<User | null> {
    return await this.userRepository.getByFirebaseId(firebaseId);
  }

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse | string> {
    const user = await this.userRepository.getByEmail(email);

    if (user) {
      try {
        const firebaseUser = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );

        const token = await firebaseUser.user.getIdToken();

        return {
          user,
          token,
        };
      } catch (error: any) {
        if (error.code) {
          return error.message;
        }
        return 'An unexpected error occurred';
      }
    }
    return 'User not found';
  }

  async create(user: UserDTO): Promise<User | string> {
    const { email, password, username } = user;
    try {
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: username,
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        firebaseId: firebaseUser.uid,
        password: hashedPassword,
        email,
        username,
      } as User;

      return await this.userRepository.create(user);
    } catch (error) {
      return error.code || 'An unexpected error occurred';
    }
  }
}
