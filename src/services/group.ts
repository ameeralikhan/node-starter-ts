import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as joiSchema from '../validations/schemas/group';
import * as groupRepo from '../repositories/group';
import * as userRepo from '../repositories/user';
import { IGroupInstance, IGroupAttributes } from '../models/group';
import { ISaveGroup } from '../interface/group';
import { IUserGroupAttributes } from '../models/user-group';

export const getAll = async (): Promise<IGroupInstance[]> => {
    return groupRepo.getAll();
};

export const saveGroup = async (group: ISaveGroup) => {
    await validate(group, joiSchema.saveGroup);
    const toSaveGroup: IGroupAttributes = {
        id: group.id,
        name: group.name,
        isActive: true
    };
    if (group.userIds && group.userIds.length) {
        const users = await userRepo.findByIds(group.userIds);
        if (users.length !== _.uniq(group.userIds).length) {
            throw boom.badRequest('Invalid User');
        }
    }
    const savedGroup = await groupRepo.saveGroup(toSaveGroup);
    if (toSaveGroup.id) {
        await groupRepo.deleteUserGroupByGroupId(toSaveGroup.id);
    }
    if (!group.userIds || !group.userIds.length) {
        return { success: true };
    }
    const userGroups: IUserGroupAttributes[] = group.userIds.map((userId) => {
        return {
            groupId: savedGroup[0].id,
            userId,
            isActive: true
        };
    });
    await groupRepo.insertUserGroup(userGroups);
    return { success: true };
};
