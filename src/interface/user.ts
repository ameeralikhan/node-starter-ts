export interface IUserRequest {
    firstName: string;
    lastName: string;
    contactNo: string;
    pictureUrl?: string;
    gender: string;
    country: string;
    city: string;
    timezone?: number;
}
