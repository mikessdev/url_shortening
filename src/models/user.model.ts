// src/models/user.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import appDataSource from '../config/database';
import { UserAttributes } from '../Interfaces/user.interface';

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'password' | 'firebaseId'
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public firebaseId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firebaseId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: appDataSource,
    modelName: 'user',
    timestamps: true,
    freezeTableName: true,
  }
);
