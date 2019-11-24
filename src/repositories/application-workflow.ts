import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationWorkflowInstance, IApplicationWorkflowAttributes } from '../models/application-workflow';

export const getByApplicationId = async (applicationId: string) => {
    return Models.ApplicationWorkflow.findAll({
        attributes: ['id', 'applicationId', 'name', 'type', 'stepId', 'order', 'assignTo',
            'isActive', 'createdAt', 'updatedAt', 'showMap'],
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
    return Models.ApplicationWorkflow.findOne({
        where: { id },
        include: [{
            model: Models.ApplicationWorkflowPermission,
            where: {
                isActive: true
            }
        }]
    });
};

export const findByIds = async (ids: string[]) => {
    return Models.ApplicationWorkflow.findAll({ where: { id: { [Sequelize.Op.in]: ids } }});
};

export const saveApplicationWorkflow = async (applicationWorkflow: IApplicationWorkflowAttributes) => {
    return Models.ApplicationWorkflow.upsert(applicationWorkflow, { returning: true })
        .then((res) => res[0]);
};

export const deleteApplicationWorkflow = async (id: string) => {
    return Models.ApplicationWorkflow.update({ isActive: false }, { where: { id }});
};
