import { UserDTO } from '../Dtos/user.dto';
import { UserAttributes as User } from '../Interfaces/user.interface';
import { User as UserModel } from '../models/user.model';

export interface IUserRepository {
  create: (user: UserDTO) => Promise<User>;
  getByEmail: (email: string) => Promise<User | null>;
  getByFirebaseId: (firebaseId: string) => Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  private readonly userModel = UserModel;

  async getByFirebaseId(firebaseId: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({
        where: {
          firebaseId,
        },
      });
    } catch (error) {
      console.error('Error finding user by firebaseId:', error);
      return null;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({
        where: {
          email,
        },
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async create(user: UserDTO): Promise<User> {
    try {
      return await this.userModel.create(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }
}
