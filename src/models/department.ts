import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IDepartmentAttributes {
    id: number;
    name: string;
    userId: string;
    isActive: boolean;
}

export interface IDepartmentInstance extends Sequelize.Instance<IDepartmentAttributes> {
    id: number;
    name: string;
    userId: string;
    isActive: boolean;
}

export interface IDepartmentModel extends Sequelize.Model<IDepartmentInstance, IDepartmentAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IDepartmentModel => {
    const model: IDepartmentModel = sequelize.define('department', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type: Sequelize.UUIDV4,
            allowNull: true,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        isActive: Sequelize.BOOLEAN
    }, {
        freezeTableName: true
    });

    model.associate = (models: IModelFactory) => {
        model.belongsTo(models.User);
    };

    return model;
};
