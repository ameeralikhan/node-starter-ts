import * as Sequelize from 'sequelize';
import { Database } from './../bootstrap/database';

// Import model specification from its own definition file.
import * as Role from './role';
import * as User from './user';
import * as ListOfValue from './list-of-value';
import * as UserRole from './user-role';

export interface IModelFactory extends Sequelize.Models {
  Role: Role.IRoleModel;
  User: User.IUserModel;
  ListOfValue: ListOfValue.IListOfValueModel;
  UserRole: UserRole.IUserRoleModel;
}

const models: IModelFactory = {
  Role: Role.define(Database),
  User: User.define(Database),
  ListOfValue: ListOfValue.define(Database),
  UserRole: UserRole.define(Database)
};

// Execute the associations where defined
Object.keys(models).map(key => {
  const model: Sequelize.Model<any, any> = models[key];

  if (model.associate) {
    model.associate(models);
  }
});

export const Models: IModelFactory = models;
