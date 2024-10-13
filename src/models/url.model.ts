import { DataTypes, Model, Optional } from 'sequelize';
import appDataSource from '../config/database';
import { UrlAttributes } from '../Interfaces/url.interface';

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
      defaultValue: null, // Você pode definir o valor padrão como null
    },
  },
  {
    sequelize: appDataSource,
    modelName: 'url',
    timestamps: true,
    paranoid: true, // Mantém a exclusão suave
    freezeTableName: true,
  }
);
