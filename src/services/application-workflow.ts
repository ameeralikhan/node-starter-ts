import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as joiSchema from '../validations/schemas/application';
import * as applicationRepo from '../repositories/application';
import * as applicationWorkflowRepo from '../repositories/application-workflow';
import * as applicationFormFieldRepo from '../repositories/application-form-field';
import * as applicationWorkflowPermissionRepo from '../repositories/application-workflow-permission';
import * as applicationWorkflowFieldPermissionRepo from '../repositories/application-workflow-field-permission';
import * as applicationFormSectionRepo from '../repositories/application-form-section';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationWorkflowInstance, IApplicationWorkflowAttributes } from '../models/application-workflow';
import { IApplicationWorkflowFieldPermissionAttributes } from '../models/application-workflow-field-permission';
import { Role } from '../enum/role';

export const getByApplicationId = async (applicationId: string): Promise<IApplicationWorkflowInstance[]> => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    return applicationWorkflowRepo.getByApplicationId(applicationId);
};

export const saveApplicationWorkflow = async (applicationId: string,
                                              applicationWorkflows: IApplicationWorkflowAttributes[]) => {
    await validate({ payload: applicationWorkflows }, joiSchema.saveApplicationWorkflowArray);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const ids = _.reject(applicationWorkflows.map(form => form.id), _.isUndefined);
    const applicationSections = await applicationWorkflowRepo.findByIds(ids);
    if (applicationSections.length !== ids.length) {
        throw boom.badRequest('Invalid application workflow id');
    }
    const userIds = _.reject(applicationWorkflows.map(form => form.userIds), _.isUndefined) as string[];
    const users = await userRepo.findByIds(userIds);
    if (users.length !== userIds.length) {
        throw boom.badRequest('Invalid user ids');
    }
    for (const workflow of applicationWorkflows) {
        workflow.applicationId = applicationId;
        if (workflow.id) {
            await applicationWorkflowPermissionRepo.hardDeleteWorkflowPermissionByWorkflowId(workflow.id);
        }
        const savedWorkflow = await applicationWorkflowRepo.saveApplicationWorkflow(workflow);
        if (!workflow.userIds) {
            continue;
        }
        for (const userId of workflow.userIds) {
            const newPermission = {
                applicationWorkflowId: savedWorkflow.id,
                userId
            };
            await applicationWorkflowPermissionRepo.saveApplicationWorkflowPermission(newPermission);
        }
    }
    return { success: true };
};

export const saveApplicationWorkflowFieldPermission = async (
    applicationId: string, applicationWorkflowFieldPermissions: IApplicationWorkflowFieldPermissionAttributes[]) => {
        await validate({ payload: applicationWorkflowFieldPermissions }, joiSchema.saveWorkflowFieldPermissionArray);
        const savedApp = await applicationRepo.findById(applicationId);
        if (!savedApp) {
            throw boom.badRequest('Invalid application id');
        }
        const formSectionIds = _.reject(applicationWorkflowFieldPermissions.map(form =>
            form.applicationFormSectionId), _.isUndefined);
        const sections = await applicationFormSectionRepo.findByIds(formSectionIds);
        if (sections.length !== formSectionIds.length) {
            throw boom.badRequest('Invalid form section ids');
        }
        const formFieldIds = _.reject(applicationWorkflowFieldPermissions.map(form =>
            form.applicationFormFieldId), _.isUndefined);
        const fields = await applicationFormFieldRepo.findByIds(formFieldIds);
        if (fields.length !== formFieldIds.length) {
            throw boom.badRequest('Invalid form field ids');
        }
        for (const workflowFieldPermission of applicationWorkflowFieldPermissions) {
            await applicationWorkflowFieldPermissionRepo.
                saveApplicationWorkflowFieldPermission(workflowFieldPermission);
        }
        return { success: true };
};
