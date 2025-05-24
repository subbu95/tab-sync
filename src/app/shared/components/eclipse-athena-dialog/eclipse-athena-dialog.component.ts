import { DetailsDataService } from '../../../services/details-data.service';
import { Component, EventEmitter, Input, Output, ViewChild, OnDestroy } from '@angular/core';
import { ButtonModule, DialogComponent, DialogModule, TabModule, IconModule, CalloutModule, SnackbarService, IconButtonModule } from '@nielseniq/athena-core';
import { CommonModule } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { CONSTANTS } from '../../../../assets/app.constants';
import { LoaderService } from '../../../services/loader.service';
import { LABELS } from '../../../../assets/details-label.constants';
import { JOB_LOG_LABELS } from './../../../../assets/jobLog-label.constants';
import { saveAs } from 'file-saver';
import { DetailsModel } from '../../../models/fup/details.model';
import { Result } from '../../../models/common/result.model';
import { JobLogDataModel } from '../../../models/fup/job-log.model';
import { UtilityService } from '../../../services/utility.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'eclipse-athena-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule, IconModule, CommonModule, TabModule, CalloutModule, IconButtonModule],
  templateUrl: './eclipse-athena-dialog.component.html',
  styleUrl: './eclipse-athena-dialog.component.scss'
})
export class EclipseAthenaDialogComponent implements OnDestroy {

  constructor(private detailsDataService: DetailsDataService, private loaderService: LoaderService, private utilService: UtilityService, private snackBar: SnackbarService) {
    this.NIQLoaderImage = this.loaderService.getNIQLoader();
  }

  @ViewChild('dialogBox', { static: true })
  dialogBox!: DialogComponent;
  @Output() confirmEvent = new EventEmitter<string>();
  @Input()
  title!: string;
  @Input()
  monId!: number;
  @Input()
  detailsPath!: string;

  stepDetailsSubscription = new Subscription();
  jobLogSubscription = new Subscription();
  saveLogSubscription = new Subscription();

  secondaryTabTitle: string = CONSTANTS.SECONDARY_TAB_TITLE;
  primaryTabTitle: string = CONSTANTS.PRIMARY_TAB_TITLE;
  isSecondaryTabActive = false;
  isPrimaryTabActive = false;
  hasError = false;
  detailsData: Result[] = [];
  logArray1: any[] = [];
  logArray2: any[] = [];
  primaryTab = "jobLog";
  secondaryTab = "details";
  tabSelected: string = this.primaryTab;
  errorMessage = '';
  errorCode = '';
  genericErrMsg = CONSTANTS.ERROR_MESSAGES.GENERIC_DATA_MESSAGE;
  jobLogDetails: any = {};
  logContent = '';
  isLogTruncated = false;
  sessionName: any = {};
  uproc: any = {};
  isJobLogAPICalled = false;
  isDetailsAPICalled = false;
  NIQLoaderImage: any = "";
  public isLoading = true;
  errorImageUrl = environment.imageBasePath +`images/Illustration_Restricted.png`;

  public openDialog(monId: number) {
    this.dialogBox.open();
    this.isLoading = true;
    this.onSelectedChange(this.primaryTab, monId);
  }
  public onCloseDialogEvent(): void {
    this.isDetailsAPICalled = false;
    this.isJobLogAPICalled = false;
  }
  public onDialogCloseIconClick(): void {
    this.isDetailsAPICalled = false;
    this.isJobLogAPICalled = false;
  }
  public confirm() {
    this.confirmEvent.emit("Confirmation");
    this.dialogBox.close();
  }
  public onSelectedChange(currentTab: string, monId: number) {
    if (currentTab === this.secondaryTab) {
      if (!this.isDetailsAPICalled) {
        //this.loaderService.showLoader();
        this.isLoading = true;
        this.getDetailsData();
      }
      this.tabSelected = this.secondaryTab;
      this.isPrimaryTabActive = false;
      this.isSecondaryTabActive = true;
    }
    else {
      if (!this.isJobLogAPICalled) {
        //this.loaderService.showLoader();
        this.isLoading = true;
        this.getJobLogData(monId);
      }
      this.tabSelected = this.primaryTab;
      this.isPrimaryTabActive = true;
      this.isSecondaryTabActive = false;
    }
  }

  public getDetailsData() {
    const sub = this.detailsDataService.getJobDetails(this.monId, this.detailsPath)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
      next: (data: DetailsModel) => {
        //this.loaderService.hideLoader();
        this.isLoading = false;
        this.detailsData = [];
        Object.keys(LABELS).forEach((key: string) => {
          if (Object.hasOwn(data.body, key) && Object.hasOwn(LABELS, key)) {
            this.detailsData.push({ label: LABELS[key], value: data.body[key] });
          }
        });
        this.isDetailsAPICalled = true;
      },
        error: (err) => {
          console.log(err);
        //this.loaderService.hideLoader();
        this.isLoading = false;
        this.isSecondaryTabActive = false;
        this.hasError = true;
        this.errorCode = err.error.status.errors[0].code + " " + err.error.status.responseStatus;
        this.errorMessage = err.error.status.errors[0].message;
      },
    });
    this.stepDetailsSubscription.add(sub);
  }

  public getJobLogData(monId: number) {
    const sub = this.detailsDataService.getJobLogDetails(monId)
      .pipe(finalize(() => {
        this.isLoading = false;

      }))
      .subscribe({
      next: (data: JobLogDataModel) => {
        //this.loaderService.hideLoader();
        this.isLoading = false;
        this.logArray1 = [];
        this.logArray2 = [];
        if (data?.body) {
          this.isLogTruncated = data.body.isTruncated || false;
          this.jobLogDetails = data.body;
          this.sessionName = data.body.session;
          this.uproc = data.body.uproc;
          this.logContent = data.body.logContent || '';
          const { logContent, ...filteredData } = data.body;
          const keys = Object.keys(JOB_LOG_LABELS);
          const middleIndex = Math.ceil(keys.length / 2);
          this.logArray1 = keys.slice(0, middleIndex).map(key => ({ label: JOB_LOG_LABELS[key], value: filteredData[key] }));
          this.logArray2 = keys.slice(middleIndex).map(key => ({ label: JOB_LOG_LABELS[key], value: filteredData[key] }));
          this.isJobLogAPICalled = true;
        } else {
          this.hasError = true;
          this.errorCode = "200";
          this.errorMessage = "Something went wrong, Empty response received";
        }
      },
        error: (err) => {
          console.log(err);
        //this.loaderService.hideLoader();
        this.isLoading = false;
        this.isPrimaryTabActive = false;
        this.hasError = true;
        if (err.error && err.error.status && err.error.status.errors) {
          this.errorCode = err.error.status.errors[0]?.code || "UnKnown Error";
          this.errorMessage = err.error.status.errors[0]?.message || "An unexpected error occurred";
        } else {
          this.errorCode = "500";
          this.errorMessage = "Something went wrong, please contact support team";
        }
      },
    });
    this.jobLogSubscription.add(sub);
  }

  deleteConfirmation(msg: string) {
    this.delete(msg);
  }
  delete(msg: string) {
    console.log(msg);
  }

  public downloadFile() {
    const sub = this.detailsDataService.downloadFile(this.monId,this.sessionName,this.uproc).subscribe({
      next: (response: Blob | MediaSource) => {
        const downloadUrl = window.URL.createObjectURL(response);
        const formattedLogFile = `${this.sessionName}_${this.uproc}_${this.monId}.log`;
        saveAs(downloadUrl, formattedLogFile)
          this.utilService.openSnackBar(
            'large',
            'success',
            'File downloading begins.It will take few minutes.',
            'success',
          );
      },
      error: (err) => {
        console.log(err);
        const errorMessage = err ? err['error'] ? err['error']['error'] ? err['error']['error']: CONSTANTS.ERROR_MESSAGES.GENERIC_DOWNLOAD_MESSAGE :  CONSTANTS.ERROR_MESSAGES.GENERIC_DOWNLOAD_MESSAGE : CONSTANTS.ERROR_MESSAGES.GENERIC_DOWNLOAD_MESSAGE
        this.snackBar.open('large', 'error', `${errorMessage}`, 'download', { 'dismissAfter': 4000 });
      }
    })
    this.saveLogSubscription.add(sub);

  }

  resetEclipseDialog(): void {
    this.isDetailsAPICalled = false;
    this.isJobLogAPICalled = false;
    this.isLoading = false;
    this.stepDetailsSubscription.unsubscribe();
    this.jobLogSubscription.unsubscribe();
    this.saveLogSubscription.unsubscribe();
  }

  ngOnDestroy(): void {
    this.resetEclipseDialog();
  }
}
