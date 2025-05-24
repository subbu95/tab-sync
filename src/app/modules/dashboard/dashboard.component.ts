import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from '@nielseniq/athena-core';
import { SessionService } from '../../services/session.service';
import { DropDownResponse, instructionStatus, SetSessionModel, UserWorkTeam } from '../../models/common/session-dropdown-model';
import { SharedService } from '../../services/shared.service';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { SessionStorageService } from '../../services/session-storage.service';
import { SessionKeys } from '../../models/common/login-model';
import { forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from '../../services/utility.service';
import { DropdownOption, FilterapiService } from '../../services/filterapi.service';
import { CronApiModel } from '../../models/common/cron-api.model';
import { CronApiService } from '../../services/cron-api.service';

@Component({
  selector: 'eclipse-dashboard',
  standalone: true,
  imports: [DropdownComponent, ButtonModule, CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashBoardComponent implements OnInit {

  workTeamCollection: UserWorkTeam[] = [];
  instructionCollection: instructionStatus[] = [];
  roleCollection: string[] = [];
  countryCollection: DropdownOption[] = []
  sendSessionValues: SetSessionModel = {};
  sessionForm!: FormGroup;
  subscription = new Subscription();
  workTeamStringCollection: string[] = []

  constructor(private cronApiService: CronApiService, protected sessionService: SessionService, protected sharedService: SharedService, protected sessionStorageService : SessionStorageService,
              protected loaderService: LoaderService, private fb: FormBuilder, private utilService: UtilityService, private filterService:FilterapiService){}

  ngOnInit(): void {
    //allowing components to subscribe the broadcastTeamChannel 
    this.sharedService.selectedTeam$.subscribe((team) => {
      if (team && team !== this.sessionForm.get('workTeam')?.value) {
        this.sessionForm.patchValue({ workTeam: team }, { emitEvent: false });
       this.setSession();
       this.loaderService.hideLoader();
       //this.sessionStorageService.set(SessionKeys.WTM_DESCRIPTION,team);
      }
    })
    this.getDropdownData();
    this.sessionForm = this.fb.group({
      workTeam: [null],
      instructionStatus: [null],
      userRole: [null]
    });
  }

  public getDropdownData(){
      this.loaderService.showLoader();
      const sub = this.sessionService.getDropdowns().subscribe({
        next: (data: DropDownResponse) => {
          this.loaderService.hideLoader();
          this.workTeamCollection = data.body.userWorkTeamResponseListDto.userWorkTeamResponseDtoList;
          this.workTeamStringCollection = this.workTeamCollection.map((x: any) => x['wtmShortDescription']);
          this.instructionCollection = data.body.instructionStatusListDto.instructionStatusDtoList;
          this.roleCollection = data.body.userRoleResponseDto.userRole;
          this.sessionForm.patchValue({
            workTeam: Number(this.sessionStorageService.get(SessionKeys.WORK_TEAM_ID)),
            instructionStatus: this.sessionStorageService.get(SessionKeys.INSTRUCTION_STATUS),
            userRole: this.sessionStorageService.get(SessionKeys.ROLE)
          });
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
      this.subscription.add(sub);
      const countryDropdownsub = this.filterService.getFieldOptions({}, 'Country').subscribe((options) => {
        this.countryCollection = options;
      });
      this.subscription.add(countryDropdownsub);
  }

  public setSession(){
    this.loaderService.showLoader();
    const wtmId: number = this.sessionForm.get('workTeam')?.value;
    const instructionStatus: string = this.sessionForm.get('instructionStatus')?.value;
    const userRole: string = this.sessionForm.get('userRole')?.value;
    const wtmDescription = this.getWorkTeamDescription(wtmId);
    const defaultCountryCode = this.getCountryCode(wtmDescription);
    const status = (userRole == 'POWER_COF' ? 'Powercof' : (instructionStatus == 'P' ? 'Production' : 'Working copy'));
    this.sessionStorageService.set(SessionKeys.WORK_TEAM_ID, wtmId);
    this.sessionStorageService.set(SessionKeys.INSTRUCTION_STATUS, instructionStatus);
    this.sessionStorageService.set(SessionKeys.ROLE, userRole);
    this.sessionStorageService.set(SessionKeys.WTM_DESCRIPTION, wtmDescription);
    this.sessionStorageService.set(SessionKeys.DEFAULT_COUNTRY_CODE, defaultCountryCode)
    this.sendSessionValues.userName = this.sessionStorageService.get(SessionKeys.USER_NAME);
    this.sendSessionValues.currentWorkTeamId = (wtmId == 0) ? null : wtmId;
    this.sendSessionValues.currentUserRole = userRole;
    this.sendSessionValues.currentInstructionStatus = instructionStatus;
    const data = {
      currentWorkTeamId: this.sendSessionValues.currentWorkTeamId,
      currentUserRole: this.sendSessionValues.currentUserRole,
      currentInstructionStatus: this.sendSessionValues.currentInstructionStatus
    };
    this.sharedService.updateTeam(wtmId, wtmDescription,status); //WorkTeam Channel Call
    
    const sub = this.sharedService.setSession(this.sendSessionValues).subscribe({
      next: (response) => {
        forkJoin({
        kawaSession: this.sharedService.setKawaSession(data),
        workTeamStatus: this.sharedService.updateWorkTeamAndStatus(wtmDescription, status),
        instructionsMenu: this.sharedService.updateInstructionsMenu()
        }).subscribe({
          next: () => {
            this.utilService.openSnackBar(
              'large',
              'success',
               response.body,
              'alert'
            );
            this.loaderService.hideLoader();
            this.cronApiService.cronAPICall();
        },
        error: (error) => {
          this.loaderService.hideLoader();
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

  public getWorkTeamDescription(wtmId?: number): string {
    const workTeam = this.workTeamCollection.find(team => team.wtmId === wtmId);
    return workTeam ? workTeam.wtmShortDescription : 'No workteam';
  }

  getCountryCode(wtmDescription:string): string {
    let countryCode = this.countryCollection.find(country => country['label'].toLocaleLowerCase() === wtmDescription.toLocaleLowerCase());
    countryCode = countryCode === undefined ? this.countryCollection.find(country => country['label'].toLocaleLowerCase().includes(wtmDescription.toLocaleLowerCase())) : countryCode;
    return countryCode ? countryCode['data'] : '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
   
  }
}
