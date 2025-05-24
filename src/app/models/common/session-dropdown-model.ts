export interface DropDownResponse {
    status: Status;
    body: Body;
}

export interface Status {
    timestamp: string;
    responseStatus: string;
    responseCode: string;
}

export interface Body {
    userWorkTeamResponseListDto: UserWorkTeamList;
    userRoleResponseDto: UserRole;
    instructionStatusListDto: instructionStatusList;
}

export interface UserWorkTeamList {
    userWorkTeamResponseDtoList: UserWorkTeam[];
}

export interface UserWorkTeam {
    wtmId: number;
    wtmShortDescription: string;
}

export interface UserRole {
    userRole: string[];
}

export interface instructionStatusList {
    instructionStatusDtoList: instructionStatus[];
}

export interface instructionStatus {
    data: string;
    label: string;
}

export interface SessionModel {
    workTeam?: number;
    instructionStatus?: string;
    userRole?: string;
}

export interface SetSessionModel {
    userName?: string;
    currentWorkTeamId?: number | null;
    currentUserRole?: string;
    currentInstructionStatus?: string;
}