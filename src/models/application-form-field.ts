import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IApplicationFormFieldAttributes {
    id: string;
    applicationFormSectionId: string;
    name: string;
    helpText: string;
    fieldId: string;
    key: string;
    type: string;
    defaultValue: string;
    templateOptions: any;
    order: number;
    isRequired: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IApplicationFormFieldInstance extends Sequelize.Instance<IApplicationFormFieldAttributes> {
    id: string;
    applicationFormSectionId: string;
    name: string;
    helpText: string;
    fieldId: string;
    key: string;
    type: string;
    defaultValue: string;
    templateOptions: any;
    order: number;
    isRequired: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IApplicationFormFieldModel
    extends Sequelize.Model<IApplicationFormFieldInstance, IApplicationFormFieldAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IApplicationFormFieldModel => {
    const model: IApplicationFormFieldModel = sequelize.define('applicationFormField', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      applicationFormSectionId: {
        type: Sequelize.UUID,
        references: {
            model: 'applicationFormSection',
            key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      helpText: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      fieldId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      defaultValue: {
        type: Sequelize.STRING,
        allowNull: true
      },
      templateOptions: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      isRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false
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
      },
    }, {
        freezeTableName: true
    });

    model.associate = (models: IModelFactory) => {
      model.belongsTo(models.ApplicationFormSection);

      model.hasMany(models.ApplicationWorkflowFieldPermission);
    };

    return model;
};
