export interface JobLogDataModel {
  status:{
    timestamp: string,
    responseStatus: string,
    responseCode: string
  },
  body: {
    [x: string]: string | number | boolean
    company: string,
    node: string,
    uproc: string,
    session: string,
    management_Unit: string,
    uproc_number: number,
    session_number: number,
    launch : string,
    monId: number,
    logContent: string,
    isTruncated: boolean
  }
}
