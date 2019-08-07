import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';
import {
  IApplicationExecutionFormAttributes,
  IApplicationExecutionFormInstance
} from './application-execution-form';

export interface IApplicationExecutionAttributes {
    id?: string;
    applicationId?: string;
    startedAt?: Date;
    status?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
    applicationExecutionForms?: IApplicationExecutionFormAttributes[];
}

export interface IApplicationExecutionInstance extends Sequelize.Instance<IApplicationExecutionAttributes> {
    id: string;
    applicationId: string;
    startedAt: Date;
    status: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
    applicationExecutionForms?: IApplicationExecutionFormInstance[];
}

export interface IApplicationExecutionModel
    extends Sequelize.Model<IApplicationExecutionInstance, IApplicationExecutionAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IApplicationExecutionModel => {
    const model: IApplicationExecutionModel = sequelize.define('applicationExecution', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      applicationId: {
        type: Sequelize.UUID,
        references: {
            model: 'application',
            key: 'id'
        }
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
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
        model.belongsTo(models.Application);

        model.hasMany(models.ApplicationExecutionForm);
        model.hasMany(models.ApplicationExecutionWorkflow);
    };

    return model;
};
