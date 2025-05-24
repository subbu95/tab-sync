export interface DetailsModel {
  body: {
    [x: string]: string | number
    monId: number,
    couCode: string,
    tprId: number,
    job_id: number,
    unix_process: number,
    session: string,
    management_unit: string,
    command_line: string,
    step: string,
    week: string,
    execution_server: string,
    status: string,
    result: string
},
  status: {
    timestamp: string,
    responseStatus: string,
    responseCode: string
},
}

export interface BodyLogDataModel {
  monId: number,
  couCode: string,
  tprId: number,
  $u_job_identifier: number,
  unix_process: number,
  session: string,
  management_unit: string,
  command_line: string,
  step: string,
  week: string,
  execution_server: string,
  status: string,
  result: string
}
