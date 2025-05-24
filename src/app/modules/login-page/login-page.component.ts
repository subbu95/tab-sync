import { Component, OnDestroy, OnInit } from '@angular/core';
import { SessionStorageService } from '../../services/session-storage.service';
import { Router } from '@angular/router';
import { LoginResponse, SessionKeys, UserDetails} from '../../models/common/login-model';
import { SharedService } from '../../services/shared.service';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../services/utility.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'eclipse-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})

export class LoginPageComponent implements OnInit, OnDestroy {
  userName!: string;

  constructor(protected loaderService: LoaderService, protected sharedService: SharedService,
    protected _sessionStorageService: SessionStorageService, private router: Router, private utilService: UtilityService, private route: ActivatedRoute) { }

  loginSubscription = new Subscription();

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.userName = params.get('userId')!;
    }); 
    
    const accessToken = this._sessionStorageService.get(SessionKeys.ACCESS_TOKEN);

    if(accessToken == null || accessToken === '')
      this.login();
    else
      this.router.navigateByUrl('/dashboard');
  }

  login(){
    this.loaderService.showLoader();
    const sub =  this.sharedService.userLogin(this.userName).subscribe({
      next: (data: LoginResponse) => {
        this.loaderService.hideLoader();
         if(data.body) {
           const userDetails: UserDetails = data.body.userDetails;
           this._sessionStorageService.set(SessionKeys.USER_ID, userDetails.userId);
           this._sessionStorageService.set(SessionKeys.USER_NAME, userDetails.userName);
           this._sessionStorageService.set(SessionKeys.EMAIL, userDetails.email);
           this._sessionStorageService.set(SessionKeys.COUNTRY_CODE, userDetails.countryCode);
           this._sessionStorageService.set(SessionKeys.LANGUAGE_CODE, userDetails.languageCode);
           this._sessionStorageService.set(SessionKeys.ACCESS_TOKEN, data.body.accessToken);
           this._sessionStorageService.set(SessionKeys.REFRESH_TOKEN, data.body.refreshToken);
           this._sessionStorageService.set(SessionKeys.FIRST_NAME, userDetails.firstName);
           this._sessionStorageService.set(SessionKeys.LAST_NAME, userDetails.lastName);
           this._sessionStorageService.set(SessionKeys.ENVIRONMENT, data.body.appInfoResponse.environment);
           this._sessionStorageService.set(SessionKeys.APPLICATION_VERSION, data.body.appInfoResponse.applicationVersion);
           this._sessionStorageService.set(SessionKeys.INSTRUCTION_STATUS, 'P');
           this._sessionStorageService.set(SessionKeys.ROLE, 'STANDARD USER');
           this._sessionStorageService.set(SessionKeys.WTM_DESCRIPTION, 'No workteam');
           this.sharedService.onLoginSuccess();
           this.router.navigateByUrl('/dashboard');
         }
      },
      error: (error) => {
        this.loaderService.hideLoader();
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
    this.loginSubscription.add(sub);
  }

  ngOnDestroy(): void {
    this.loginSubscription.unsubscribe();
  }
}
