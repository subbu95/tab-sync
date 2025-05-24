import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DetailsModel } from '../models/fup/details.model';
import { JobLogDataModel } from '../models/fup/job-log.model';

@Injectable({
  providedIn: 'root'
})
export class DetailsDataService {

  private mockDataPath = 'assets/mock_data.json';
  private mockJobDataPath = 'assets/mock_job_data.json';
  private url = 'assets/file.log';

  constructor(private _http: HttpClient) { }

  getJobDetails(monId?: number, apiPath?: string): Observable<DetailsModel> {
    // return this._http.get(this.mockDataPath);
    const id = String(monId)
    const params = new HttpParams().set('monId', id);
    return this._http.get<DetailsModel>(`${environment.eclipseURL}` + apiPath, { params: params });
  }

  getJobLogDetails(monId?: number): Observable<JobLogDataModel> {
    const id = String(monId)
    const params = new HttpParams().set('monId', id);
    return this._http.get<JobLogDataModel>(`${environment.eclipseURL}fup/view-job-log?`, { params: params });
  }

  getFile(): Observable<Blob> {
    return this._http.get(this.url, { responseType: 'blob' });
  }

  downloadFile(monId: number, sessionName: string, uproc: string): Observable<Blob> {
    const id = String(monId);
    const params = new HttpParams()
    .set('monId', id)
    .set('sessionName', sessionName)
    .set('uproc', uproc);
    const url = `${environment.eclipseURL}fup/save-job-log?`;
    return this._http.get(url, {responseType: 'blob', params: params})
  }

  getExcelExportFile(path: string, fileName: string, fileFormat: string, selectedFilterValues: any ): Observable<Blob> {
    const url = environment.eclipseURL + path;
    let params = new HttpParams()
      .set('fileName', fileName)
      .set('fileFormat', fileFormat);
    Object.keys(selectedFilterValues).forEach((key) => {
      params = params.append(key, selectedFilterValues[key]);
    });
    return this._http.get(url, { responseType: 'blob', params: params })
  }
}
