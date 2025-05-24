export interface CronApiModel {
    status: Status;
    body: Body;
}
export interface Status {
    timestamp: string,
    responseStatus: string,
    responseCode: string
}
export interface Body {
    isSessionRunning: boolean
}