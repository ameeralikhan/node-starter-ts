import { IUserLanguageRequest } from './teacher';

export interface IUserRequest {
    firstName: string;
    lastName: string;
    contactNo: string;
    pictureUrl?: string;
    gender: string;
    country: string;
    city: string;
    countryOfBirth: string;
    skypeId: string;
    yearOfBirth: number;
    timezone?: number;
    languages: IUserLanguageRequest[];
}
