/**
 * Custom definition for Express.Request and other types
 */
import { User } from '../../entities/user.entity';
declare module 'express-session' {
    interface SessionData {
        user: User | undefined | null;
        username: string | null;
        loggedin: boolean | null;
        authority: number | null;
        userId: number | null;
        searchQuery: Record<string, unknown> | null;
    }
}

declare global {
    namespace Express {
        // tslint:disable-next-line:interface-name
        interface Request {
            user: Partial<models.User> & {
                token?: {
                    accessToken: string;
                    refreshToken: string;
                };
                isAuthorized: boolean;
                getServiceOption(): {
                    endpoint: string;
                    accessToken?: string;
                    refreshToken?: string;
                    storeToken?(token: { accessToken: string; refreshToken: string; }): void;
                };
                destroy(): void;
            };
            flash(message: string, value?: unknown): string[];
            consumeSession<X>(): { formData?: X; message?: IMessage; };
        }
    }
}

export type CustomEntityApiResult<Entity> = {
    message?: string | null;
    messages?: string[] | null;
    data?: Entity | Entity[] | unknown | null;
    status?: number;
    count?: number;
};
export type CustomApiResult = {
    status?: number;
    message?: string | null;
};

export type CustomDataTableResult = {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: unknown[];
};

export interface CustomUserData {
    "ID": string | number;
    "User Name": string;
    "Position": string | number,
    "Created Date": string | Date,
    "Entered Date": string | Date,
    "Deleted Date": string | Date,
    "Updated Date": string | Date,
    "id": string;
    "email": string;
    "name": string;
    "division_id": string | number;
    "position_id": string | number;
    "deleted": string;
}

export interface CustomDivisionData {
    "ID": string | number;
    "Division Name": string,
    "Division Note": string,
    "Division Leader": string | number,
    "Floor Number": string | number,
    "Created Date": string | Date,
    "Deleted Date": string | Date,
    "Updated Date": string | Date,
    "id": string,
    "name": string,
    "note": string,
    "division_leader_id": string | number,
    "division_floor_num": string | number,
    "created_date": string | Date,
    "updated_date": string | Date,
    "deleted_date": string | Date;
    "Delete": string;
}

export type CustomValidateResult<Entity> = {
    isValid: boolean;
    message?: string;
    data?: Entity | null;
    datas?: Entity[] | null;
};

export type SearchUserListResult = {
    "ID": number;
};

export type DestinationCallback = (error: Error | null, destination: string) => void;

export type FileNameCallback = (error: Error | string | string[] | null, filename: string) => void;

export interface Data {
    [key: string]: string;
}
