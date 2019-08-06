import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IApplicationExecutionWorkflowAttributes {
    id?: string;
    applicationExecutionId: string;
    applicationWorkflowId: string;
    comments?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export interface IApplicationExecutionWorkflowInstance
    extends Sequelize.Instance<IApplicationExecutionWorkflowAttributes> {
    id?: string;
    applicationExecutionId: string;
    applicationWorkflowId: string;
    comments?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export interface IApplicationExecutionExecutionModel
    extends Sequelize.Model<IApplicationExecutionWorkflowInstance, IApplicationExecutionWorkflowAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IApplicationExecutionExecutionModel => {
    const model: IApplicationExecutionExecutionModel = sequelize.define('applicationExecutionWorkflow', {
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
      applicationWorkflowId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'applicationWorkflow',
          key: 'id'
        }
      },
      comments: {
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
        model.belongsTo(models.ApplicationWorkflow);
    };

    return model;
};
