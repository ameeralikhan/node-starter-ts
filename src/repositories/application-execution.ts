import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { ApplicationExecutionStatus } from './../enum/application';

export const getAll = async () => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
        },
        include: [{
            model: Models.ApplicationExecutionForm,
            attributes: ['id', 'applicationExecutionId', 'applicationFormFieldId', 'value', 'isActive'],
            where: {
                isActive: true
            },
            include: [{
                model: Models.ApplicationFormField,
            }],
        }, {
            model: Models.Application
        }]
    });
};

export const getByApplicationId = async (applicationId: string) => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            applicationId
        },
        include: [{
            model: Models.ApplicationExecutionForm,
            attributes: ['id', 'applicationExecutionId', 'applicationFormFieldId', 'value', 'isActive'],
            where: {
                isActive: true
            },
            include: [{
                model: Models.ApplicationFormField,
            }],
        }, {
            model: Models.Application
        }]
    });
};

export const findById = async (id: string) => {
    return Models.ApplicationExecution.findOne({
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            id
        },
        include: [{
            model: Models.ApplicationExecutionForm,
            attributes: ['id', 'applicationExecutionId', 'applicationFormFieldId', 'value', 'isActive'],
            where: {
                isActive: true
            },
            include: [{
                model: Models.ApplicationFormField,
            }],
        }]
    });
};

export const getApplicationExecutionByLoggedInUser = async (userId: string, type: string) => {
    let innerWhere = {};
    if (type) {
        innerWhere = {
            type
        };
    }
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
        },
        include: [{
            model: Models.Application,
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionWorkflow,
            where: {
                status: ApplicationExecutionStatus.DRAFT
            },
            include: [{
                model: Models.ApplicationWorkflow,
                where: innerWhere,
                include: [{
                    model: Models.ApplicationWorkflowPermission,
                    where: {
                        userId
                    }
                }]
            }]
        }]
    });
};

export const findByIds = async (ids: string[]) => {
    return Models.ApplicationExecution.findAll({ where: { id: { [Sequelize.Op.in]: ids } }});
};

export const saveApplicationExecution = async (applicationExecution: IApplicationExecutionAttributes) => {
    return Models.ApplicationExecution.upsert(applicationExecution, { returning: true })
        .then((res) => res[0]);
};

export const deleteApplicationExecution = async (id: string) => {
    return Models.ApplicationExecution.update({ isActive: false }, { where: { id }});
};
