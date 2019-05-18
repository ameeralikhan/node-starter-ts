import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationWorkflowPermissionInstance,
    IApplicationWorkflowPermissionAttributes
} from '../models/application-workflow-permission';

export const findById = async (id: string) => {
    return Models.ApplicationWorkflowPermission.findOne({ where: { id }});
};

export const saveApplicationWorkflowPermission =
    async (applicationWorkflowPermission: IApplicationWorkflowPermissionAttributes) => {
    return Models.ApplicatioApplicationWorkflowPermissionnWorkflow.insertOrUpdate(applicationWorkflowPermission);
};

export const deleteApplicationWorkflowPermission = async (id: string) => {
    return Models.ApplicationWorkflowPermission.update({ isActive: false }, { where: { id }});
};
