import { Injectable } from '@angular/core';
import { DropDownResponse } from '../models/common/session-dropdown-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  
  constructor(private _http: HttpClient) { }

  getDropdowns(): Observable<DropDownResponse> {
    return this._http.get<DropDownResponse>(`${environment.eclipseURL}session/selectionList`);
  }
}
