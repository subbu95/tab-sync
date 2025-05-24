import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CronApiModel } from '../models/common/cron-api.model';
import { UtilityService } from './utility.service';


@Injectable({
  providedIn: 'root'
})
export class CronApiService {

  private cronMessageSubject = new BehaviorSubject<boolean>(false);
  cronMessage$ = this.cronMessageSubject.asObservable();

  constructor(private _http: HttpClient, private utilService: UtilityService) { }

  getCronApi(): Observable<CronApiModel> {
    return this._http.get<CronApiModel>(`${environment.eclipseURL}common/instruction-refresh`);
  }

  sendCronClickEvent(message: boolean) {
    this.cronMessageSubject.next(message);
  }

  cronAPICall() {
    this.getCronApi().subscribe({
      next: (cronApiData: CronApiModel) => {
        this.sendCronClickEvent(cronApiData.body.isSessionRunning);
      },
      error: (error) => {
        this.utilService.openSnackBar(
          'large',
          'error',
          error.error?.error ||
          error.error?.message ||
          error.error?.status?.errors?.[0]?.message ||
          'An unknown error occurred',
          'alert'
        );
      }
    });
  }
}
