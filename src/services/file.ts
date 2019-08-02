import * as fs from 'fs-extra';
import * as cloudinary from './cloudinary';
import * as joiSchema from '../validations/schemas/file';
import { validate } from './../validations/index';

export const saveProfilePicture = async (userId: string, file: any) => {
  await validate({ file }, joiSchema.uploadUserProfileImage);
  const fileName = file.name;
  const nameToSave = `/upload/profile/${userId}_${fileName}`;
  const buff = fs.readFileSync(file.path);
  if (!fs.existsSync(`${__dirname}/../../upload/profile`)) {
    fs.mkdirSync(`${__dirname}/../../upload/profile`);
  }
  fs.writeFileSync(`${__dirname}/../../${nameToSave}`, buff);
  return { fileKey: `${userId}_${fileName}` };
};

export const uploadProfilePicture = async (userId: string, file: any) => {
  await validate({ file }, joiSchema.uploadUserProfileImage);
  const fileName = file.name;
  const result: any = await cloudinary.uploadProfileImage(`${userId}_${fileName}`, file);
  return { url: result.url };
};

export const saveExecutionFile = async (prefix: string, file: any) => {
  await validate({ file }, joiSchema.uploadUserProfileImage);
  const fileName = file.name;
  const nameToSave = `./upload/${prefix}_${fileName}`;
  const buff = fs.readFileSync(file.path);
  fs.outputFileSync(nameToSave, buff);
  return { fileKey: `${prefix}_${fileName}` };
};
