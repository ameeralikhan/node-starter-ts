import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IApplicationExecutionFormAttributes {
    id: string;
    applicationExecutionId: string;
    applicationFormFieldId: string;
    value: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export interface IApplicationExecutionFormInstance extends Sequelize.Instance<IApplicationExecutionFormAttributes> {
    id: string;
    applicationExecutionId: string;
    applicationFormFieldId: string;
    value: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export interface IApplicationExecutionFormModel
    extends Sequelize.Model<IApplicationExecutionFormInstance, IApplicationExecutionFormAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IApplicationExecutionFormModel => {
    const model: IApplicationExecutionFormModel = sequelize.define('applicationExecutionForm', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      applicationExecutionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'applicationExecution',
          key: 'id'
        }
      },
      applicationFormFieldId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'applicationFormField',
          key: 'id'
        }
      },
      value: {
        type: Sequelize.STRING(1000),
        allowNull: true
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
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        }
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        }
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
        model.belongsTo(models.ApplicationExecution);
        model.belongsTo(models.ApplicationFormField);
    };

    return model;
};
