import * as roleRepo from '../repositories/role';
import { IRoleInstance, IRoleAttributes } from '../models/role';

export const getAll = async (): Promise<IRoleInstance[]> => {
    return roleRepo.getAll();
};
