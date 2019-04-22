import * as Sequelize from 'sequelize';

import { IModelFactory } from './index';

export interface IOfficeLocationAttributes {
    id: number;
    name: string;
    userId: string;
    isActive: boolean;
}

export interface IOfficeLocationInstance extends Sequelize.Instance<IOfficeLocationAttributes> {
    id: number;
    name: string;
    userId: string;
    isActive: boolean;
}

export interface IOfficeLocationModel extends Sequelize.Model<IOfficeLocationInstance, IOfficeLocationAttributes> { }

export const define = (sequelize: Sequelize.Sequelize): IOfficeLocationModel => {
    const model: IOfficeLocationModel = sequelize.define('officeLocation', {
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
