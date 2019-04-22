import * as Sequelize from 'sequelize';
import { Database } from './../bootstrap/database';

// Import model specification from its own definition file.
import * as Role from './role';
import * as User from './user';
import * as Department from './department';
import * as OfficeLocation from './office-location';
import * as Group from './group';
import * as UserGroup from './user-group';
import * as ListOfValue from './list-of-value';

export interface IModelFactory extends Sequelize.Models {
  Role: Role.IRoleModel;
  User: User.IUserModel;
  Department: Department.IDepartmentModel;
  OfficeLocation: OfficeLocation.IOfficeLocationModel;
  Group: Group.IGroupModel;
  UserGroup: UserGroup.IUserGroupModel;
  ListOfValue: ListOfValue.IListOfValueModel;
}

const models: IModelFactory = {
  Role: Role.define(Database),
  User: User.define(Database),
  Department: Department.define(Database),
  OfficeLocation: OfficeLocation.define(Database),
  Group: Group.define(Database),
  UserGroup: UserGroup.define(Database),
  ListOfValue: ListOfValue.define(Database),
};

// Execute the associations where defined
Object.keys(models).map(key => {
  const model: Sequelize.Model<any, any> = models[key];

  if (model.associate) {
    model.associate(models);
  }
});

export const Models: IModelFactory = models;
