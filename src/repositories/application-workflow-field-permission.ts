import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationWorkflowFieldPermissionInstance,
    IApplicationWorkflowFieldPermissionAttributes
} from '../models/application-workflow-field-permission';

export const findById = async (id: string) => {
    return Models.ApplicationWorkflowFieldPermission.findOne({ where: { id }});
};

export const saveApplicationWorkflowFieldPermission =
    async (applicationWorkflowFieldPermission: IApplicationWorkflowFieldPermissionAttributes) => {
    return Models.ApplicationWorkflowFieldPermission.upsert(applicationWorkflowFieldPermission, { returning: true })
        .then((res) => res[0]);
};

export const deleteApplicationWorkflowFieldPermission = async (id: string) => {
    return Models.ApplicationWorkflowFieldPermission.update({ isActive: false }, { where: { id }});
};
