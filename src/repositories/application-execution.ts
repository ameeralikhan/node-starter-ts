import * as Sequelize from 'sequelize';

import { Database } from './../bootstrap/database';
import { Models } from '../models/index';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { ApplicationExecutionStatus } from './../enum/application';
import { IGetExecutionSelect } from '../interface/application';

export const getAll = async (userId: string, applyCreatedBy: boolean = false) => {
    const where: any = {
        isActive: true
    };
    if (applyCreatedBy) {
        where.createdBy = userId;
    }
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt'],
        where,
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
            model: Models.Application,
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

export const getAllForParticipatedReport = async (userId: string, applyCreatedBy: boolean = false) => {
    const where: any = {
        isActive: true
    };
    if (applyCreatedBy) {
        where.createdBy = userId;
    }
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt'],
        where,
        include: [{
            model: Models.Application,
            where: {
                isActive: true
            }
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
        attributes: ['id', 'applicationId', 'startedAt', 'status', 'createdAt', 'updatedAt', 'latitude', 'longitude'],
        where: {
            isActive: true,
            id
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
            include: [{
                model: Models.ApplicationWorkflow,
                include: [{
                    model: Models.ApplicationWorkflowPermission,
                }]
            }]
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

export const getApprovedApplicationExecutions = async (userId: string) => {
    return Models.ApplicationExecution.findAll({
        attributes: ['id', 'applicationId', 'title', 'startedAt', 'status', 'createdAt', 'updatedAt', 'createdBy'],
        where: {
            isActive: true,
            updatedBy: userId,
            status: ApplicationExecutionStatus.APPROVED
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
                status: ApplicationExecutionStatus.APPROVED
            },
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
            attributes: ['id', 'subject'],
            where: {
                isActive: true
            },
        }, {
            model: Models.ApplicationExecutionForm,
            attributes: ['id', 'applicationFormFieldId'],
            include: [{
                model: Models.ApplicationFormField
            }],
            where: {
                isActive: true
            }
        }, {
            model: Models.ApplicationExecutionWorkflow,
            attributes: ['id', 'applicationWorkflowId'],
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

export const getApplicationExecutionsForTimeReport = async (
    applicationId: string, startDate: string, endDate: string) => {
    const result = await Database.query(`
        select distinct execution.id, execution."createdAt", execution."createdBy", app."name",
        execution."applicationId",
        (
            select REPLACE(app.subject, concat('{', ef."fieldId", '}'), ef.value) from "applicationExecutionForm" ef
            where ef."applicationExecutionId" = execution.id and
            app.subject ilike concat('%', ef."fieldId", '%') limit 1
        ) as title
        from "applicationExecution" execution
        inner join application app on execution."applicationId" = app.id and app."isActive" = true
        inner join "user" u on u.id = execution."createdBy"
        where execution."applicationId" = '${applicationId}' and execution."isActive" = true
        and execution."createdAt" >= '${startDate}' and execution."createdAt" < '${endDate}'
    `).then((res) => res[0]);
    return result;
};

// Raw query
export const getDraftApplicationExecutionQuery =
    async (userId: string, status: string): Promise<IGetExecutionSelect[]> => {
        const result = await Database.query(`
        select distinct execution.id, execution."createdAt", execution."createdBy", app."name",
        u."managerId", u."departmentId", u."officeLocationId", execution."applicationId", ew."applicationWorkflowId",
        (
            select REPLACE(app.subject, concat('{', ef."fieldId", '}'), ef.value) from "applicationExecutionForm" ef
            where ef."applicationExecutionId" = execution.id and
            app.subject ilike concat('%', ef."fieldId", '%') limit 1
        ) as title
        from "applicationExecution" execution
        inner join application app on execution."applicationId" = app.id and app."isActive" = true
        inner join "user" u on u.id = execution."createdBy"
        left join "applicationExecutionWorkflow" ew on ew."applicationExecutionId" = execution.id
        and ew."isActive" = true
        where execution."createdBy" = '${userId}' and execution.status = '${status}'
        and execution."isActive" = true
    `).then((res) => res[0]);
        return result;
    };

export const getApplicationExecutionInProcessQuery =
    async (userId: string, status: string): Promise<IGetExecutionSelect[]> => {
        const result = await Database.query(`
        select distinct execution.id, execution."createdAt", execution."createdBy", app."name",
        u."managerId", u."departmentId", u."officeLocationId", execution."applicationId", ew."applicationWorkflowId",
        (
            select REPLACE(app.subject, concat('{', ef."fieldId", '}'), ef.value) from "applicationExecutionForm" ef
            where ef."applicationExecutionId" = execution.id and
            app.subject ilike concat('%', ef."fieldId", '%') limit 1
        ) as title
        from "applicationExecution" execution
        inner join application app on execution."applicationId" = app.id and app."isActive" = true
        inner join "user" u on u.id = execution."createdBy"
        left join "applicationExecutionWorkflow" ew on ew."applicationExecutionId" = execution.id
        and ew."isActive" = true
        where execution."createdBy" = '${userId}' and execution."isActive" = true
        and execution."status" = '${status}'
    `).then((res) => res[0]);
        return result;
    };

export const getApplicationExecutionByWorkflowTypeAndStatusQuery =
    async (status: string, type: string): Promise<IGetExecutionSelect[]> => {
        const result = await Database.query(`
        select distinct execution.id, execution."createdAt", execution."createdBy", app."name",
        u."managerId", u."departmentId", u."officeLocationId", execution."applicationId", ew."applicationWorkflowId",
        (
            select REPLACE(app.subject, concat('{', ef."fieldId", '}'), ef.value) from "applicationExecutionForm" ef
            where ef."applicationExecutionId" = execution.id and
            app.subject ilike concat('%', ef."fieldId", '%') limit 1
        ) as title
        from "applicationExecution" execution
        inner join application app on execution."applicationId" = app.id and app."isActive" = true
        inner join "user" u on u.id = execution."createdBy"
        inner join "applicationExecutionWorkflow" ew on ew."applicationExecutionId" = execution.id
        and ew.status = '${status}' and ew."isActive" = true
        inner join "applicationWorkflow" workflow on ew."applicationWorkflowId" = workflow.id
        and workflow.type = '${type}' and workflow."isActive" = true
        where execution."isActive" = true
    `).then((res) => res[0]);
        return result;
    };

export const getParticipatedApplicationExecutionQuery =
    async (userId: string): Promise<IGetExecutionSelect[]> => {
        const result = await Database.query(`
        select distinct execution.id, execution."createdAt", execution."createdBy", execution."applicationId",
        app."name", aew."applicationWorkflowId",
        (
            select REPLACE(app.subject, concat('{', ef."fieldId", '}'), ef.value) from "applicationExecutionForm" ef
            where ef."applicationExecutionId" = execution.id and
            app.subject ilike concat('%', ef."fieldId", '%') limit 1
        ) as title
        from "applicationExecution" execution
        inner join application app on execution."applicationId" = app.id and app."isActive" = true
        inner join "user" u on u.id = execution."createdBy"
        inner join "applicationExecutionWorkflow" aew on aew."applicationExecutionId" = execution.id
        where aew.status = 'approved' and (aew."createdBy" = '${userId}' OR aew."updatedBy" = '${userId}');
    `).then((res) => res[0]);
        return result;
    };

export const getTotalApplicationExecutionQuery =
    async (applicationId: string, startDate: string, endDate: string): Promise<IGetExecutionSelect[]> => {
        const result = await Database.query(`
        select distinct execution.id, execution."createdAt",
        (
            select REPLACE(app.subject, concat('{', ef."fieldId", '}'), ef.value) from "applicationExecutionForm" ef
            where ef."applicationExecutionId" = execution.id and
            app.subject ilike concat('%', ef."fieldId", '%') limit 1
        ) as title
        from "applicationExecution" execution
        inner join application app on execution."applicationId" = app.id and app."isActive" = true
        inner join "user" u on u.id = execution."createdBy"
        inner join "applicationExecutionWorkflow" aew on aew."applicationExecutionId" = execution.id
        where execution."applicationId" = '${applicationId}' and execution."isActive" = true
        and execution."createdAt" >= '${startDate}' and execution."createdAt" < '${endDate}'
    `).then((res) => res[0]);
        return result;
    };

export const findByIds = async (ids: string[]) => {
    return Models.ApplicationExecution.findAll({ where: { id: { [Sequelize.Op.in]: ids } } });
};

export const saveApplicationExecution = async (applicationExecution: IApplicationExecutionAttributes) => {
    return Models.ApplicationExecution.upsert(applicationExecution, { returning: true })
        .then((res) => res[0]);
};

export const deleteApplicationExecution = async (id: string, updatedBy: string) => {
    return Models.ApplicationExecution.update({ isActive: false, updatedBy }, { where: { id } });
};
