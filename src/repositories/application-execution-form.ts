import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import {
    IApplicationExecutionFormInstance,
    IApplicationExecutionFormAttributes
} from '../models/application-execution-form';

export const getByApplicationExecutionId = async (applicationExecutionId: string) => {
    return Models.ApplicationExecutionForm.findAll({
        attributes: ['id', 'applicationExecutionId', 'applicationFormFieldId', 'value', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            applicationExecutionId
        },
        include: [{
            model: Models.ApplicationFormField,
            where: {
                isActive: true
            }
        }]
    });
};

export const getByApplicationExecutionIdAndFieldId = async (applicationExecutionId: string, fieldId: string) => {
    return Models.ApplicationExecutionForm.findOne({
        attributes: ['id', 'applicationExecutionId', 'applicationFormFieldId', 'value', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            applicationExecutionId,
            fieldId
        },
    });
};

export const findById = async (id: string) => {
    return Models.ApplicationExecutionForm.findOne({ where: { id }});
};

export const findByIds = async (ids: string[]) => {
    return Models.ApplicationExecutionForm.findAll({ where: { id: { [Sequelize.Op.in]: ids } }});
};

export const saveApplicationExecutionForm = async (applicationExecutionForm: IApplicationExecutionFormAttributes) => {
    return Models.ApplicationExecutionForm.upsert(applicationExecutionForm, { returning: true })
        .then((res) => res[0]);
};

export const deleteApplicationExecutionForm = async (id: string) => {
    return Models.ApplicationExecutionForm.update({ isActive: false }, { where: { id }});
};
