import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormatDataPipe } from './../shared/pipe/formatdata.pipe';
import { environment } from '../../environments/environment';
import { SessionKeys } from '../models/common/login-model';
import { SessionStorageService } from './session-storage.service';

interface ApiResponseStatus {
  responseStatus: string;
  responseCode: string;
}

interface CommonResponseBody {
  content?: object[];
  collectionDataDtoList?: object[];
  userFilterDetailsDtoList?: object[];
  listOfHistoryResponseDto?: object[];
}

export interface ApiResponse {
  status: ApiResponseStatus;
  body: CommonResponseBody;
}

export type DropdownOption = Record<string, string>;

@Injectable({
  providedIn: 'root'
})

export class FilterapiService {

  private readonly filterApiURL = environment.eclipseURL;
  private mockData = {
    country: [{ fdoId: '1', label: "INDIA" }, { fdoId: '2', label: "EUROPE" }, { fdoId: '3', label: "USA" }] as DropdownOption[],
    laststep: [{ fdoId: '1', label: "Option 1" }, { fdoId: '2', label: "Option 2" }, { fdoId: '3', label: "Option 3" }] as DropdownOption[],
    user: [{ fdoId: '1', firstName: "User 1" }, { fdoId: '2', firstName: "User 2" }, { fdoId: '3', firstName: "User 3" }] as DropdownOption[],
    result: [{ fdoId: '1', label: "OK" }, { fdoId: '2', label: "NOT OK" }] as DropdownOption[],
    status: [{ fdoId: '1', label: "Running" }, { fdoId: '2', label: "Done" }, { fdoId: '3', label: "Failed" }] as DropdownOption[],
    cvncode: [{ fdoId: '0', label: "CVN 1" }, { fdoId: '1', label: "CVN 2" }, { fdoId: '2', label: "CVN 3" }] as DropdownOption[],
  };
  private dataFormatPipe = new FormatDataPipe();
  private dropDownOptionSubject = new BehaviorSubject<Record<string, DropdownOption[]>>({});
  public filterDataSubject = new BehaviorSubject<Record<string, ApiResponse>>({});
  public filterFormValuesSubject = new BehaviorSubject<object>({});
  constructor(private http: HttpClient, private sessionStorageService: SessionStorageService) { }

  private fetchData<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(endpoint, { withCredentials: true });
  }

  // Get field options based on request payload and option field name
  getFieldOptions(requestPayload: object, optionFieldName: string): Observable<DropdownOption[]> {
    let endpoint = this.dataFormatPipe.transform(optionFieldName);
    // Return mock data for testing
    if (this.dropDownOptionSubject.value && this.dropDownOptionSubject.value[endpoint]) {
      return new Observable(observer => {
        observer.next(this.dropDownOptionSubject.value[endpoint]);
        observer.complete();
      });
    } else {
      if (endpoint === 'laststep') {
        let screenName;
        if ('screenName' in requestPayload) {
          screenName = requestPayload['screenName'];
        }
        endpoint = `fup/last-step?stepCode=${screenName}`;
      } else if (endpoint === 'resolutiontype') {
        endpoint = `fup/resolution-type`;
      } else if (endpoint === 'status' || endpoint === 'result') {
        endpoint = `common/label?labelName=eclipse.fup.common.${endpoint}&lngCode=${this.sessionStorageService.get(SessionKeys.LANGUAGE_CODE)}`;
      } else if (endpoint === 'user') {
        let userName;
        if ('userName' in requestPayload) {
          userName = requestPayload['userName'];
        }
        endpoint = `common/${endpoint}-filter-details?userName=${userName}`;
      } else {
        endpoint = `common/${endpoint}`;
      }
      return this.fetchData<ApiResponse>(`${this.filterApiURL}${endpoint}`).pipe(
        map((data: ApiResponse) => {
          if (data && data.status && data.body && (Array.isArray(data.body.collectionDataDtoList) || Array.isArray(data.body.userFilterDetailsDtoList))) {
            const { responseStatus, responseCode } = data.status;
            const expectedStatus = 'success';
            const expectedCode = '200';
            if (this.dataFormatPipe.transform(responseStatus) === expectedStatus && responseCode === expectedCode) {
              let collectionData: DropdownOption[] = [];
              // Determine the collection data type and process accordingly
              if (endpoint.includes('user')) {
                collectionData = data.body.userFilterDetailsDtoList as DropdownOption[];
              } else {
                collectionData = data.body.collectionDataDtoList as DropdownOption[];
              }
              const ldos = this.dropDownOptionSubject.value;
              if (endpoint !== 'user') {
                ldos[endpoint] = collectionData;
              }
              this.dropDownOptionSubject.next(ldos);
              return collectionData;
            } else {
              console.error(`Unexpected response status or code: ${responseStatus}, ${responseCode}`);
              this.dropDownOptionSubject.next({});
              return [];
            }
          } else {
            console.error('Invalid response structure', data);
            this.dropDownOptionSubject.next({});
            return [];
          }
        }),
        catchError((error) => {
          console.error('Error fetching field options:', error);
          this.dropDownOptionSubject.next({});
          return [];
        })
      );
    }
  }

  // Fetch data with filters applied
  filterFetch(endpoint: string, filterQueryObject: Record<string, string>): Observable<ApiResponse> {
    const filterQuery = new URLSearchParams(filterQueryObject).toString();
    return this.fetchData<ApiResponse>(`${this.filterApiURL}${endpoint}?${filterQuery}`).pipe(
      map((data: ApiResponse) => {
        if (data && data.status && data.body) {
          const { responseStatus, responseCode } = data.status;
          const expectedStatus = 'success';
          const expectedCode = '200';
          if (this.dataFormatPipe.transform(responseStatus) === expectedStatus && responseCode === expectedCode) {
            const ldos = this.filterDataSubject.value;
            ldos[endpoint] = data;
            this.filterDataSubject.next(ldos);
            return data;  // Explicitly return the data if everything is valid
          } else {
            console.error('Unexpected response status or code:', responseStatus, responseCode);
            throw new Error('Unexpected response status or code');
          }
        } else {
          console.error('Invalid response structure', data);
          throw new Error('Invalid response structure');
        }
      }),
      catchError((err) => {
        console.error('Error in filterFetch:', err);
        err = typeof err === 'object' && err.error && err.error.status && err.error.status.errors.length ? err.error.status.errors[0].message : '';
        throw new Error(err);
      })
    );
  }
} 