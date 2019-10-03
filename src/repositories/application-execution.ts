import * as Sequelize from 'sequelize';

import { Database } from './../bootstrap/database';
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

export const getApplicationExecutionsForApproval = async (type: string) => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'title', 'startedAt', 'status', 'createdAt', 'updatedAt', 'createdBy'],
        where: {
            isActive: true,
        },
        include: [{
            model: Models.User,
            as: 'createdByUser'
        }, {
            model: Models.Application,
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionForm,
            include: [{
                model: Models.ApplicationFormField
            }],
            where: {
                isActive: true
            }
        }, {
            model: Models.ApplicationExecutionWorkflow,
            where: {
                status: ApplicationExecutionStatus.DRAFT
            },
            include: [{
                model: Models.ApplicationWorkflow,
                where: {
                    type
                },
                include: [{
                    model: Models.ApplicationWorkflowPermission,
                }]
            }]
        }]
    });
};

export const getApplicationExecutionsForApprovalCount = async (userId: string, type: string) => {
    return Models.ApplicationExecution.count({
        where: {
            isActive: true,
        },
        include: [{
            model: Models.User,
            as: 'createdByUser'
        }, {
            model: Models.ApplicationExecutionWorkflow,
            where: {
                status: ApplicationExecutionStatus.DRAFT
            },
            include: [{
                model: Models.ApplicationWorkflow,
                where: {
                    type
                },
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

export const getDraftApplicationExecutions = async (userId: string) => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'title', 'startedAt', 'status', 'createdAt', 'updatedAt', 'createdBy'],
        where: {
            isActive: true,
            createdBy: userId,
            status: ApplicationExecutionStatus.DRAFT
        },
        include: [{
            model: Models.Application,
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionForm,
            include: [{
                model: Models.ApplicationFormField
            }],
            where: {
                isActive: true
            }
        }, {
            model: Models.ApplicationExecutionWorkflow,
            include: [{
                model: Models.ApplicationWorkflow,
            }]
        }]
    });
};

export const getDraftApplicationExecutionsCount = async (userId: string) => {
    return Models.ApplicationExecution.count({
        where: {
            isActive: true,
            createdBy: userId,
            status: ApplicationExecutionStatus.DRAFT
        },
        include: [{
            model: Models.Application,
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionForm,
            where: {
                isActive: true
            }
        }]
    });
};

export const getApplicationExecutionInProcess = async (userId: string, status: string) => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'title', 'startedAt', 'status', 'createdAt', 'updatedAt', 'createdBy'],
        where: {
            isActive: true,
            createdBy: userId
        },
        include: [{
            model: Models.Application,
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionForm,
            include: [{
                model: Models.ApplicationFormField
            }],
            where: {
                isActive: true
            }
        }, {
            model: Models.ApplicationExecutionWorkflow,
            where: {
                status
            },
            include: [{
                model: Models.ApplicationWorkflow,
            }]
        }]
    });
};

export const getApplicationExecutionInProcessCount = async (userId: string, status: string) => {
    return Models.ApplicationExecution.count({
        where: {
            isActive: true,
            createdBy: userId
        },
        include: [{
            model: Models.ApplicationExecutionWorkflow,
            where: {
                status
            },
            include: [{
                model: Models.ApplicationWorkflow,
            }]
        }]
    });
};

export const getApplicationExecutionParticipatedIds = async (userId: string) => {
    return Database.query(`
        WITH
        A AS (
            SELECT
            "applicationExecutionId", jsonb_array_elements("comments") AS comments
            FROM "applicationExecutionWorkflow"
        )
        SELECT distinct("applicationExecutionId") as id
        FROM A
        WHERE (comments->>'userId') = '${userId}';
    `);
};

export const getApplicationExecutionsByIds = async (ids: string[]) => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'title', 'startedAt', 'status', 'createdAt', 'updatedAt', 'createdBy'],
        where: {
            isActive: true,
            id: {
                [Sequelize.Op.in]: ids
            },
        },
        include: [{
            model: Models.Application,
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionForm,
            include: [{
                model: Models.ApplicationFormField
            }],
            where: {
                isActive: true
            }
        }, {
            model: Models.ApplicationExecutionWorkflow,
            include: [{
                model: Models.ApplicationWorkflow,
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

export const deleteApplicationExecution = async (id: string, updatedBy: string) => {
    return Models.ApplicationExecution.update({ isActive: false, updatedBy }, { where: { id }});
};
