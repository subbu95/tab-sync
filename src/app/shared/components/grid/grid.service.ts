import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  private apiUrl = 'https://your-api.com/api/data';

  constructor(private http: HttpClient) {}

  fetchData(page: number, size: number, sortColumn: string, sortOrder: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}&sort=${sortColumn},${sortOrder}`);
  }
}
