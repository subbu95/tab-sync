import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ChipModule, IconButtonModule } from '@nielseniq/athena-core';
import { ScreenheaderbuttonclickService } from './../../../services/screenheaderbuttonclick.service';
import { CONSTANTS } from '../../../../assets/app.constants';
import { DetailsDataService } from '../../../services/details-data.service';
import saveAs from 'file-saver';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FilterapiService } from './../../../services/filterapi.service';
import { SnackbarService } from '@nielseniq/athena-core';
import { Router } from '@angular/router';
import { UtilityService } from '../../../services/utility.service';
export interface screenHeaderComponentDetailsObject {
  screenTitle: string;
  back: {
    actionIconName: string;
    actionLabelName: string;
  },
  download: {
    actionIconName: string;
    actionLabelName: string;
  },
  filter: {
    actionIconName: string;
    actionLabelName: string;
  },
  reset: {
    actionLabelName: string;
    isFilterReset: boolean;
  }
  refresh: {
    actionIconName: string;
    actionLabelName: string;
  }
}

@Component({
  selector: 'eclipse-screenheader',
  standalone: true,
  imports: [IconButtonModule,ChipModule,CommonModule],
  templateUrl: './screenheader.component.html',
  styleUrl: './screenheader.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ScreenheaderComponent implements OnDestroy {
  @Input() screenHeaderComponentDetails!: screenHeaderComponentDetailsObject;
  @Input() excelExportApiPath!: string;
  @Input() isLoading!: boolean;
  @Input () dataArray!: object[];

  constructor(public screenHeaderActionClick: ScreenheaderbuttonclickService, private detailsDataService: DetailsDataService,
    private filterService: FilterapiService, private snackBar: SnackbarService, private router: Router, private utilService: UtilityService) { }

  saveLogSubscription = new Subscription();

  returnToDashboard(){
    this.router.navigateByUrl('/dashboard');
  }

  onActionClick(action: string) {
    this.screenHeaderActionClick.emitHeaderActionClick(action);
  }


  onDownload() {
    const filterValues = this.filterService.filterFormValuesSubject.value;
    const sub = this.detailsDataService.getExcelExportFile(this.excelExportApiPath,
      this.screenHeaderComponentDetails.screenTitle, CONSTANTS.FUP.FILE_FORMAT, filterValues).subscribe({
        next: (response: Blob | MediaSource) => {
          const downloadUrl = window.URL.createObjectURL(response)
          saveAs(downloadUrl, this.screenHeaderComponentDetails.screenTitle)
          this.utilService.openSnackBar(
            'large',
            'success',
            'File downloading begins.It will take few minutes.',
            'alert'
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

  ngOnDestroy(): void {
    this.saveLogSubscription.unsubscribe();
  }
}
