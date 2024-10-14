import { DataTypes, Model, Optional } from 'sequelize';
import appDataSource from '../config/database';
import { UrlAttributes } from '../Interfaces/url.interface';
import { User } from './user.model';

export interface UrlCreationAttributes
  extends Optional<
    UrlAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
  > {}

export class Url
  extends Model<UrlAttributes, UrlCreationAttributes>
  implements UrlAttributes
{
  public id!: number;
  public originalUrl!: string;
  public shortenedUrl!: string;
  public totalAccesses!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date | null;
  public userId?: number;
}

Url.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    originalUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortenedUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    totalAccesses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize: appDataSource,
    modelName: 'url',
    timestamps: true,
    paranoid: true,
    freezeTableName: true,
  }
);

Url.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Url, { foreignKey: 'userId', as: 'urls' });
