import * as boom from 'boom';
import * as languageRepo from '../repositories/language';
import { ILanguageInstance } from './../models/language';

export const findAll = async (): Promise<ILanguageInstance[]> => {
  return languageRepo.findAll();
};
