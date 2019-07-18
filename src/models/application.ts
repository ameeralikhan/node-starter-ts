import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IApplicationAttributes {
    id: string;
    name: string;
    shortDescription: string;
    userIds: string;
    canAllStart: boolean;
    canAllEdits: boolean;
    editableUserIds: string;
    isPublished: boolean;
    isActive: boolean;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    deletedAt?: Date;
    deletedBy?: string;
}

export interface IApplicationInstance extends Sequelize.Instance<IApplicationAttributes> {
    id: string;
    name: string;
    shortDescription: string;
    userIds: string;
    canAllStart: boolean;
    canAllEdits: boolean;
    editableUserIds: string;
    isPublished: boolean;
    isActive: boolean;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    deletedAt?: Date;
    deletedBy?: string;
}

export interface IApplicationModel extends Sequelize.Model<IApplicationInstance, IApplicationAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IApplicationModel => {
    const model: IApplicationModel = sequelize.define('application', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shortDescription: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      userIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      canAllStart: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      canAllEdits: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      editableUserIds: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        }
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deletedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        }
      }
    }, {
        freezeTableName: true
    });

    model.associate = (models: IModelFactory) => {
        model.hasMany(models.ApplicationWorkflowFieldPermission);
        model.hasMany(models.ApplicationWorkflow);
        model.hasMany(models.ApplicationFormSection);
        model.hasMany(models.ApplicationExecution);
    };

    return model;
};
