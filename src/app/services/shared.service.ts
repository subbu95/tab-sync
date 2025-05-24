import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SetSessionModel } from '../models/common/session-dropdown-model';
import { BehaviorSubject, Observable, of, Subscription, switchMap } from 'rxjs';
import { MenuService } from './menu.service';
import { SubMenuItem } from '../models/common/menu-model';
import { LoginResponse, SessionKeys } from '../models/common/login-model';
import { SessionStorageService } from './session-storage.service';
import { Router } from '@angular/router';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private workteamAndStatus = new BehaviorSubject<{ workTeam: string, instructionStatus: string } | null>(null);
  private updateInstMenu = new BehaviorSubject<any>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public $refreshToken = new BehaviorSubject<boolean>(false);
  public $refreshTokenReceived = new BehaviorSubject<boolean>(false);
  public workTeamChannel = new BroadcastChannel('WorkTeamChannel');// Create a Broadcast Channel
  private selectedTeamSubject = new BehaviorSubject<number | null >(null);
  public selectedTeam$ = this.selectedTeamSubject.asObservable();


  workteamAndStatus$ = this.workteamAndStatus.asObservable();
  updateInstMenu$ = this.updateInstMenu.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  subscription = new Subscription();

  constructor(private _http: HttpClient, private menuService: MenuService, protected _sessionStorageService: SessionStorageService, private router: Router, private utilService: UtilityService, private ngZone: NgZone) {
  //Listen for message- Receiving a message
  this.workTeamChannel.onmessage = (event) => {
      this.ngZone.run(() => {
        const newTeam = event.data;
        this.selectedTeamSubject.next(newTeam);
      })
    }
  }

	// Sending a message-broadcasted to all other tabs/windows that have joined the same channel
  updateTeam(team: number | null , data : any, status: any): void {
    this.updateWorkTeamAndStatus(data, status);
    this.selectedTeamSubject.next(team);
    this.workTeamChannel.postMessage(team);

  }

  setSession(payload: SetSessionModel): Observable<any> {
    return this._http.post<any>(`${environment.eclipseURL}session/setSession`, payload);
  }

  getRefreshToken() {
    const payload = {
      "refreshToken": this._sessionStorageService.get(SessionKeys.REFRESH_TOKEN)
    }

    this._http.post<any>(`${environment.eclipseURL}auth/refreshToken`, payload).subscribe(({
      next: (data: any) => {
        if (data && data.body) {
          console.log(data.body + "Refresh Token");
          this._sessionStorageService.set(SessionKeys.ACCESS_TOKEN, data.body.accessToken);
          this._sessionStorageService.set(SessionKeys.REFRESH_TOKEN, data.body.refreshToken);
        }
      },
      error: (error) => {
        console.log(error + "Refresh token subscription failed");
        sessionStorage.clear();
        window.location.href = `${environment.kawaURL}portal.action`;
      }
    }
    ));
  }

  updateWorkTeamAndStatus(workTeam: string, instructionStatus: string): Observable<void> {
    this.workteamAndStatus.next({ workTeam, instructionStatus });
    return of(void 0);
  }

  updateInstructionsMenu(): Observable<void>{
    const sub = this.menuService.getInstructionMenu().subscribe({
          next: (data: SubMenuItem[]) => {
            this.updateInstMenu.next(data);
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
     this.subscription.add(sub);
     return of(void 0);
  }

  userLogin(userName: string) {
    return this._http.post<LoginResponse>(`${environment.eclipseURL}auth/login`, { "userName": userName }, { withCredentials: true });
  }

  onLoginSuccess() {
    this.isAuthenticatedSubject.next(true);
  }

  userLogout() {
      this.onSignOut().subscribe({
        next: (data: any) => {
          if (data.message) {
            window.location.href = `${environment.kawaURL}logoff.action`;
          }
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
      this._sessionStorageService.clear();
  }

  onSignOut() {
    return this._http.get<any>(`${environment.eclipseURL}logout`);
  }

   ngOnDestroy() {
    this.subscription.unsubscribe();
    //this.workTeamChannel.close();
  }

  setKawaSession(data: any): Observable<any> {
    console.log(`${environment.kawaURL}`);
    return this._http.post(
      `${environment.kawaURL}com/acnielsen/eclipse/session/setSessionAngular.action`,
      data,
      { withCredentials: true }
    );
  }

  callKawaLogout(): Observable<any> {
    return this._http.get(
      `${environment.kawaURL}logoff.action`
    );
  }
  getCacheClear(): Observable<any> {
    return this._http.get(`${environment.eclipseURL}common/clear-cache`);
  }
}

