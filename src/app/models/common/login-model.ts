export interface Status {
    timestamp: string;
    responseStatus: string;
    responseCode: string;
}

export interface UserDetails {
    userId: number;
    userName: string;
    userIsOnHold: string;
    userActivationDate: string;
    userTerminationDate: string;
    userIsGuest: string;
    userType: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: number;
    companyName: string;
    countryCode: string;
    countryDescription: string;
    languageCode: string;
    isSystemAdmin: number;
}

export interface AppInfoResponse {
    applicationName: string;
    applicationVersion: string;
    environment: string;
}

export interface Body {
    userDetails: UserDetails;
    appInfoResponse: AppInfoResponse;
    accessToken: string;
    refreshToken: string;    
}

export interface LoginResponse {
    status: Status;
    body: Body;
}

export enum SessionKeys {
    USER_ID = 'userId',
    USER_NAME = 'userName',
    EMAIL = 'email',
    COUNTRY_CODE = 'countryCode',
    LANGUAGE_CODE = 'languageCode',
    ACCESS_TOKEN = 'accessToken',
    REFRESH_TOKEN = 'refreshToken',
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    APPLICATION_VERSION = 'applicationVersion',
    ENVIRONMENT = 'environment',
    WORK_TEAM_ID = 'workTeamId',
    INSTRUCTION_STATUS = 'instructionStatus',
    ROLE = 'userRole',
    WTM_DESCRIPTION = 'workTeamDescription',
    DEFAULT_COUNTRY_CODE = 'defaultCountryCode'
}
