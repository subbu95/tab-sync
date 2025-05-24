import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LegacyComponentService {
  legacyUrl: BehaviorSubject<string> = new BehaviorSubject<string>('');
  legacyUrl$ = this.legacyUrl.asObservable();
  isLoading: boolean = true;
  private messageSubject = new BehaviorSubject<boolean>(false); // Or your data type
  message$ = this.messageSubject.asObservable();

  constructor() { }

  sendIframeClickEvent(message: boolean) {
    this.messageSubject.next(message);
  }
}
