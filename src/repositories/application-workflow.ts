import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationWorkflowInstance, IApplicationWorkflowAttributes } from '../models/application-workflow';

export const getByApplicationId = async (applicationId: string) => {
    return Models.ApplicationWorkflow.findAll({
        attributes: ['id', 'applicationId', 'name', 'type', 'order', 'isActive', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            applicationId
        },
        include: [{
            model: Models.ApplicationWorkflowPermission,
            where: {
                isActive: true
            }
        }],
        order: ['order']
    });
};

export const findById = async (id: string) => {
    return Models.ApplicationWorkflow.findOne({ where: { id }});
};

export const saveApplicationWorkflow = async (applicationWorkflow: IApplicationWorkflowAttributes) => {
    return Models.ApplicationWorkflow.insertOrUpdate(applicationWorkflow);
};

export const deleteApplicationWorkflow = async (id: string) => {
    return Models.ApplicationWorkflow.update({ isActive: false }, { where: { id }});
};
