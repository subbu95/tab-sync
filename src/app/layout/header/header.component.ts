import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/session-storage.service';
import { SessionKeys } from '../../models/common/login-model';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CronTaskComponent } from '../../shared/components/cron-task/cron-task.component';
import { CronApiService } from '../../services/cron-api.service';
import { CronApiModel } from '../../models/common/cron-api.model';
import { UtilityService } from '../../services/utility.service';
import { Router } from '@angular/router';
import { IconModule } from '@nielseniq/athena-core';
import { SetSessionModel } from '../../models/common/session-dropdown-model';
import { LoaderService } from '../../services/loader.service';


@Component({
  selector: 'eclipse-header',
  standalone: true,
  imports: [ProfileComponent,CommonModule,CronTaskComponent,IconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  currentWorkteam = 'No workteam';
  instructionStatus = 'Production';
  applicationName = 'Instructions';
  applicationVersion = '';
  environment = '';
  userName = '';
  firstName = '';
  lastName = '';
  cronApiMessage = "NRSP Refresh in progress. Please do not update instruction!";
  logoUrl = environment.imageBasePath +`images/NIQ-logo-bright-blue.svg`;
  sessionRunning!:boolean;
  subscription = new Subscription();
  sendSessionValues: SetSessionModel = {};

  constructor(private sharedService: SharedService, private sessionStorageService : SessionStorageService,private cronApiService: CronApiService,
    private loaderService: LoaderService,private utilService: UtilityService, private _router: Router ) {
     this.applicationVersion = sessionStorageService.get(SessionKeys.APPLICATION_VERSION);
     this.environment = sessionStorageService.get(SessionKeys.ENVIRONMENT);
     this.firstName = sessionStorageService.get(SessionKeys.FIRST_NAME);
     this.lastName = sessionStorageService.get(SessionKeys.LAST_NAME);
     this.userName = this.firstName + " " + this.lastName;
     this.currentWorkteam =  sessionStorageService.get(SessionKeys.WTM_DESCRIPTION);
     this.instructionStatus =  sessionStorageService.get(SessionKeys.INSTRUCTION_STATUS) == 'P' ? 'Production' : 'Working copy';
      this.cronApiService.cronMessage$.subscribe((isBannerActive: boolean) => {
        this.sessionRunning = isBannerActive;
      });
  }

  ngOnInit(): void {
    // this.sharedService.selectedTeam$.subscribe((newTeam : any) => {
    //   if(newTeam !== null)
    //   this.currentWorkteam = newTeam;
      

    // });
    const sub =  this.sharedService.workteamAndStatus$.subscribe(workTeamAndStatus => {
      if (workTeamAndStatus) {
        this.currentWorkteam = workTeamAndStatus.workTeam;
        this.instructionStatus = workTeamAndStatus.instructionStatus;
      }
    });
    this.subscription.add(sub);
    this.cronApiService.getCronApi().subscribe({
      next: (cronApiData: CronApiModel) => {
        this.sessionRunning = cronApiData.body.isSessionRunning;
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

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE_HEADER_AND_MENU') {
        this.sessionStorageService.set(SessionKeys.WORK_TEAM_ID, event.data.payload.id);
        this.sessionStorageService.set(SessionKeys.WTM_DESCRIPTION, event.data.payload.description);
        this.sendSessionValues.userName = this.sessionStorageService.get(SessionKeys.USER_NAME);
        this.sendSessionValues.currentWorkTeamId = event.data.payload.id;
        this.sendSessionValues.currentUserRole = this.sessionStorageService.get(SessionKeys.ROLE);
        const status = (this.sendSessionValues.currentUserRole == 'POWER_COF' ? 'Powercof' : (this.sessionStorageService.get(SessionKeys.INSTRUCTION_STATUS) == 'P' ? 'Production' : 'Working copy'));
        this.sendSessionValues.currentInstructionStatus = status;

        const subscription = this.sharedService.setSession(this.sendSessionValues).subscribe({
              next: (response) => {
                this.currentWorkteam = event.data.payload.description;
                this.instructionStatus = status;
                this.sharedService.updateInstructionsMenu().subscribe({
                  next: () => {
                    this.cronApiService.cronAPICall();
                },
                error: (error) => {
                  this.cronApiService.cronAPICall();
                  this.utilService.openSnackBar(
                    'large',
                    'error',
                    error.error?.error ||
                    error.error?.message ||
                    error.error?.status?.errors?.[0]?.message ||
                    'An unknown error occurred',
                    'alert'
                  );
                }});
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
              },
            });
            this.subscription.add(sub);
      }
    });
  }
  cronApiMessageEmitter(session: boolean): void {
    this.sessionRunning = session;
  }

  public redirectToDashboard(){
    this._router.navigateByUrl('/dashboard');
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    //this.sharedService.getCacheClear().subscribe();
  }
}
