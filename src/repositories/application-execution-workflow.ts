import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import {
    IApplicationExecutionWorkflowInstance,
    IApplicationExecutionWorkflowAttributes
} from '../models/application-execution-workflow';

export const getByApplicationExecutionId = async (applicationExecutionId: string) => {
    return Models.ApplicationExecutionWorkflow.findAll({
        attributes: ['id', 'applicationExecutionId', 'applicationWorkflowId', 'comments', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            applicationExecutionId
        },
        include: [{
            model: Models.ApplicationWorkflow,
            where: {
                isActive: true
            }
        }]
    });
};

export const getByApplicationExecutionIds = async (applicationExecutionIds: string[]) => {
    return Models.ApplicationExecutionWorkflow.findAll({
        attributes: ['id', 'applicationExecutionId', 'applicationWorkflowId', 'comments', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            applicationExecutionId: {
                [Sequelize.Op.in]: applicationExecutionIds
            }
        },
        include: [{
            model: Models.ApplicationWorkflow,
            where: {
                isActive: true
            }
        }]
    });
};

export const findById = async (id: string) => {
    return Models.ApplicationExecutionWorkflow.findOne({ where: { id }});
};

export const findByIds = async (ids: string[]) => {
    return Models.ApplicationExecutionWorkflow.findAll({ where: { id: { [Sequelize.Op.in]: ids } }});
};

export const saveApplicationExecutionWorkflow =
    async (applicationExecutionForm: IApplicationExecutionWorkflowAttributes) => {
    return Models.ApplicationExecutionWorkflow.upsert(applicationExecutionForm, { returning: true })
        .then((res) => res[0]);
};

export const updateApplicationExecutionWorkflow =
    async (status: string, applicationExecutionId: string, applicationWorkflowId: string) => {
    return Models.ApplicationExecutionWorkflow.update({ status }, { where: {
        applicationExecutionId,
        applicationWorkflowId
    }})
        .then((res) => res[0]);
};

export const deleteApplicationExecutionWorkflowForm = async (id: string) => {
    return Models.ApplicationExecutionWorkflow.update({ isActive: false }, { where: { id }});
};
