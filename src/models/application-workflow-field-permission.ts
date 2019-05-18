import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IApplicationWorkflowFieldPermissionAttributes {
    id: string;
    applicationFormSectionId: string;
    applicationFormFieldId: string;
    permission: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IApplicationWorkflowFieldPermissionInstance
    extends Sequelize.Instance<IApplicationWorkflowFieldPermissionAttributes> {
    id: string;
    applicationFormSectionId: string;
    applicationFormFieldId: string;
    permission: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IApplicationWorkflowFieldPermissionModel extends
    Sequelize.Model<IApplicationWorkflowFieldPermissionInstance, IApplicationWorkflowFieldPermissionAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IApplicationWorkflowFieldPermissionModel => {
    const model: IApplicationWorkflowFieldPermissionModel = sequelize.define('applicationWorkflowFieldPermission', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      applicationFormSectionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'applicationFormSection',
          key: 'id'
        }
      },
      applicationFormFieldId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'applicationFormField',
          key: 'id'
        }
      },
      permission: {
        type: Sequelize.STRING,
        allowNull: false,
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
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
        freezeTableName: true
    });

    model.associate = (models: IModelFactory) => {
      model.belongsTo(models.ApplicationFormSection);
      model.belongsTo(models.ApplicationFormField);
    };

    return model;
};
