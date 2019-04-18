import * as Sequelize from 'sequelize';
import { IRoleAttributes, IRoleInstance } from './role';

import { IModelFactory } from './index';

export interface IUserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  password: string;
  roleId: number;
  contactNo: string;
  pictureUrl: string;
  gender: string;
  country: string;
  city: string;
  countryOfBirth: string;
  skypeId: string;
  yearOfBirth: number;
  timezone: string;
  isApproved: boolean;
  isActive: boolean;
  role: IRoleAttributes;
}

export interface IUserInstance extends Sequelize.Instance<IUserAttributes> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  password: string;
  roleId: number;
  contactNo: string;
  pictureUrl: string;
  gender: string;
  country: string;
  city: string;
  countryOfBirth: string;
  skypeId: string;
  yearOfBirth: number;
  timezone: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  role: IRoleInstance;
}

export interface IUserModel extends Sequelize.Model<IUserInstance, IUserAttributes> {}

export const define = (sequelize: Sequelize.Sequelize): IUserModel => {
  const model: IUserModel = sequelize.define(
    'user',
    {
      id: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'role',
          key: 'id',
        },
      },
      contactNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pictureUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      countryOfBirth: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      skypeId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      yearOfBirth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isApproved: Sequelize.BOOLEAN,
      isActive: Sequelize.BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );

  model.associate = (models: IModelFactory) => {
    model.belongsTo(models.Role);
  };

  return model;
};
