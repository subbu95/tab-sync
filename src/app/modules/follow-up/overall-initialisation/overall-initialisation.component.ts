import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { IconButtonModule, SidePanelModule, SidePanelOverlayComponent, SnackbarService } from '@nielseniq/athena-core';
import { FilterdrawerComponent } from '../../../shared/components/filterdrawer/filterdrawer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FilterapiService } from '../../../services/filterapi.service';
import { ScreenheaderComponent } from '../../../shared/components/screenheader/screenheader.component';
import { Subscription } from 'rxjs';
import { ScreenheaderbuttonclickService } from '../../../services/screenheaderbuttonclick.service';
import { CommonGridComponent } from '../../../shared/components/common-grid/common-grid.component';
import { GridComponent } from '../../../shared/components/grid/grid.component';
import { GridUiComponent } from '../../../shared/components/grid-ui/grid-ui.component';
import * as iniConfig from './overall-initialisation.config';
import { EclipseAthenaDialogComponent } from '../../../shared/components/eclipse-athena-dialog/eclipse-athena-dialog.component';
import { CONSTANTS } from './../../../../assets/app.constants';
import { LoaderService } from '../../../services/loader.service';
import { environment } from '../../../../environments/environment';
import { SessionStorageService } from '../../../services/session-storage.service';
import { SessionKeys } from '../../../models/common/login-model';
import { filterFieldDetailsObject } from '../../../shared/components/filterdrawer/filterdrawer.interface';
import { UtilityService } from '../../../services/utility.service';
import { historyScreenDetailsObject } from '../../../shared/components/history/history.component';
import { SharedService } from '../../../services/shared.service';
import { DashBoardComponent } from '../../dashboard/dashboard.component';

@Component({
  selector: 'eclipse-overall-initialisation',
  standalone: true,
  imports: [SidePanelModule, FilterdrawerComponent, IconButtonModule, CommonModule,
    ScreenheaderComponent, CommonGridComponent, EclipseAthenaDialogComponent,
    GridComponent, GridUiComponent],
  templateUrl: './overall-initialisation.component.html',
  styleUrl: './overall-initialisation.component.scss'
})
export class OverallInitialisationComponent implements OnInit, OnDestroy, AfterViewInit {
  childColumns = ['Step', 'Type', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Start date', 'End date'];
  currentPage = 0;
  pageSize = environment.pageSize;
  pageIndex: number = 0;
  currentSort = { active: '', direction: '' };
  totalRecords = 0;
  enablePagination = true;
  enableSorting = true;
  filterFormDataSubscription: Subscription[] = []; // Subscription array for unsubscribing on component destroy

  title = CONSTANTS.DETAILS_TITLE;
  monId!: number;
  detailsPath: string = CONSTANTS.FUP.INI.STEP_DETAILS_API_PATH;
  jobLogPath: string = CONSTANTS.FUP.JOB_LOB_API_PATH;
  NIQLoaderImage: any = "";
  illustrationImage: any = "";

  @ViewChild(EclipseAthenaDialogComponent, { static: false }) child?: EclipseAthenaDialogComponent;
  subscriptionList: Subscription[] = [];
  public dataArray!: object[];
  public columns = iniConfig.columns; // Get the grid column names from component config
  public filterFieldDetails!: filterFieldDetailsObject; // Get the filter field details from component config
  public filterDetails = iniConfig.filterDetails; // Get the filter details from component config
  public screenHeaderComponentDetails = iniConfig.screenHeaderComponentDetails; // Get the header details from component config like title & action buttons
  public historyScreenDetails = iniConfig.historyScreenDetails; // Get the history screen details from component config
  public excelExportApiPath = iniConfig.excelExportApiPath;
  errorMessage = "";
  defaultQueryObject: Record<string, string> = {};
  public sortDirection: Record<string, "asc" | "desc" | ""> = {};
  @ViewChild("niqSidePanel", { static: true }) filterDrawer!: SidePanelOverlayComponent;
  @ViewChild(FilterdrawerComponent) filterDrawerComponent!: FilterdrawerComponent;
  constructor(public router: Router, public filterService: FilterapiService, private cdr :ChangeDetectorRef,
    public screenHeaderActionClick: ScreenheaderbuttonclickService, public filterSnackbar: SnackbarService,
    private loaderService: LoaderService, public utilityService: UtilityService,
    protected sharedService: SharedService,
    private sessionStorageService: SessionStorageService, private route: ActivatedRoute) {
    this.NIQLoaderImage = this.loaderService.getNIQLoader();
    this.illustrationImage = this.utilityService.getIllustrationImage();
  }
  ngOnInit() {
    this.sharedService.selectedTeam$.subscribe((team) => {
    //   const existing = this.sessionStorageService.get(SessionKeys.WORK_TEAM_ID);
  
    //    confirm("Change");
    if(team){
      //this.sessionStorageService.set(SessionKeys.WTM_DESCRIPTION,team);
      this.cdr.detectChanges()
      //this.initializeComponent();
    }
   
    
  })
  this.initializeComponent();
}
    //     const sessionPayload = {
    //       currentWorkTeamId : team,
    //       currentUserRole:'',
    //       currentInstructionStatus:''
    //     };
    //     this.sharedService.setSession(sessionPayload).subscribe(()=>{
    //       this.loaderService.hideLoader();
    //     })
    //   }
    //   else {
    //     this.loaderService.hideLoader();
    //   }
    // })
    initializeComponent () : void{
    this.columns.forEach(column => this.sortDirection[this.utilityService.keyMapping(column)] = '');
    this.route.queryParams.subscribe((params) => {
      iniConfig.filterFieldDetails.dropDown?.forEach(field => {
        if (field.formGroupKeyName === "couCode") {
          field.fieldDefaultValue = this.sessionStorageService.get(SessionKeys.WTM_DESCRIPTION) === 'No workteam' ? 'FR' : this.sessionStorageService.get(SessionKeys.DEFAULT_COUNTRY_CODE);
        }
      });
      this.filterFieldDetails = iniConfig.filterFieldDetails;
      const sub = this.screenHeaderActionClick.headerActionClick.subscribe((action) => {
        if (action === 'filter') {
          this.openFilterPopup();
        } else if (action === 'reset') {
          this.currentPage = 0;
          this.pageSize = environment.pageSize;
          this.pageIndex = 0;
          this.filterDrawerComponent.resetFilters(true);
          this.screenHeaderComponentDetails.reset.isFilterReset = false;
          this.prepareGridDetailsForFetch();
        } else if (action === 'refresh') {
          this.fetchGridDetails();
        }
      });
      this.subscriptionList.push(sub);
      const listSub = this.screenHeaderActionClick.listActionClick.subscribe((action: string) => {
        const actionObject = JSON.parse(action);
        if (actionObject && actionObject['actionName'] === 'history' && actionObject['rowData']) {
          this.loaderService.showLoader();
          const rowData: historyScreenDetailsObject = actionObject['rowData'];
          Object.entries(rowData).forEach(([key, value]) => {
            this.historyScreenDetails[key as keyof historyScreenDetailsObject] = value;
          });
          this.navigateToComponent('follow-up/eclipse-history', 'history');
        }
      });
      this.subscriptionList.push(listSub);
      if (params && params['data'] && JSON.parse(params['data'])['isReturnTo']
        && JSON.parse(params['data'])['defaultQuery'] && Object.keys(this.filterService.filterFormValuesSubject.value).length > 0) {
        this.defaultQueryObject = JSON.parse(params['data'])['defaultQuery'];
        this.filterService.filterFormValuesSubject.next(this.filterService.filterFormValuesSubject.value);
      } else {
        this.screenHeaderComponentDetails.reset.isFilterReset = false;
        this.prepareGridDetailsForFetch();
      }
    });
    //subscribe filter query behaviour subject
    const filterSubscription = this.filterService.filterFormValuesSubject.subscribe(() => {
      this.fetchGridDetails();
    });
    this.subscriptionList.push(filterSubscription);
  }

  ngAfterViewInit() {
    const filterQueryObject = this.filterService.filterFormValuesSubject.getValue();
    let commonKeys = Object.keys(this.defaultQueryObject).filter(key => key in filterQueryObject);
    const notCheckingKey = ['pageNumber', 'pageSize', 'sortBy', 'orderBy'];
    commonKeys = commonKeys.filter(key => !notCheckingKey.includes(key));
    const isDefaultQuery = Object.keys(filterQueryObject).length === Object.keys(this.defaultQueryObject).length && (commonKeys.every(key => this.defaultQueryObject[key] === filterQueryObject[key as keyof typeof filterQueryObject]));
    if (!isDefaultQuery) {
      this.filterDrawerComponent.filterForm.patchValue(this.filterService.filterFormValuesSubject.getValue())
    }
  }
  openFilterPopup() {
    this.filterDrawer.open();
  }
  closeFilterPopup(data?: object) {
    this.filterDrawer.close();
    this.currentPage = 0;
    this.pageSize = environment.pageSize;
    this.pageIndex = 0;
    const filterQueryObject = this.filterService.filterFormValuesSubject.getValue();
    let commonKeys = Object.keys(this.defaultQueryObject).filter(key => key in filterQueryObject);
    const notCheckingKey = ['pageNumber', 'pageSize', 'sortBy', 'orderBy'];
    commonKeys = commonKeys.filter(key => !notCheckingKey.includes(key));
    const isDefaultQuery = Object.keys(filterQueryObject).length === Object.keys(this.defaultQueryObject).length && (commonKeys.every(key => this.defaultQueryObject[key] === filterQueryObject[key as keyof typeof filterQueryObject]));
    if (!isDefaultQuery) {
      this.screenHeaderComponentDetails.reset.isFilterReset = true;
    } else {
      this.screenHeaderComponentDetails.reset.isFilterReset = false;
    }
  }

  navigateToComponent(componentURL: string, componentType: 'history' | 'others') {
    if (componentType === 'history') {
      const historyData: any = this.historyScreenDetails;
      historyData['defaultQuery'] = this.defaultQueryObject;
      this.router.navigate([componentURL],
        { queryParams: { data: JSON.stringify(historyData) }, skipLocationChange: true });
    } else {
      this.router.navigate([componentURL]);
    }
  }

  // Unsubscribes from any active subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptionList.forEach(sub => sub.unsubscribe());
    this.loaderService.hideLoader();
    this.filterFieldDetails = {};
  }


  public deleteConfirmation(msg: string) {
    console.log("delete", msg);
  }

  onRowClick(event: { rowDetails: any }) {
    this.monId = event.rowDetails.monId;
    this.child?.openDialog(this.monId);
  }

  onPageChange(event: { pageIndex: number, pageSize: number }) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filterService.filterFormValuesSubject.next(this.filterService.filterFormValuesSubject.value);
  }

  onSortChange(event: { active: string, direction: string, sortDirection: any }) {
    this.currentSort = event;
    this.filterService.filterFormValuesSubject.next(this.filterService.filterFormValuesSubject.value);
  }

  // Fetch grid details based on filters, pagination, and sorting
  fetchGridDetails() {
   this.loaderService.showLoader();
    const filterFormValues: any = this.filterService.filterFormValuesSubject.value;
    // Add pagination and sorting to filterFormValues
    if (this.enablePagination) {
      filterFormValues['pageNumber'] = this.currentPage;
      filterFormValues['pageSize'] = this.pageSize;
    }

    if (this.enableSorting) {
      filterFormValues['sortBy'] = this.currentSort.active;
      filterFormValues['orderBy'] = this.currentSort.direction;
    }

    this.dataArray = [];
    // Call the API and handle response
    this.filterService.filterFetch(`fup/${this.filterDetails['screenName']}/list`, filterFormValues).subscribe({
      next: (data: any) => {
        this.filterService.filterDataSubject.next(data);
        this.dataArray = data.body.content || [];
        this.totalRecords = data.body.totalElements || 0;
        this.loaderService.hideLoader();
      },
      error: (err) => {
        this.loaderService.hideLoader();
        console.error('Error fetching data', err);
        this.errorMessage = err && err.message ? err.message : err;
        this.dataArray = [];
        this.loaderService.hideLoader();
      }
    });

  }

  // Prepare grid details for fetching, populating the filter form values
  prepareGridDetailsForFetch() {
    this.defaultQueryObject = {};
    Object.keys(this.filterFieldDetails).forEach(fieldType => {
      this.filterFieldDetails[fieldType as keyof typeof this.filterFieldDetails]?.forEach(field => {
        if (field) {
          let formGroupKeyName, formGroupFromKeyName, fieldDefaultValue, fromFieldDefaultValue;
          if ('fieldDefaultValue' in field) {
            fieldDefaultValue = field['fieldDefaultValue'];
          }
          if ('fromFieldDefaultValue' in field) {
            fromFieldDefaultValue = field['fromFieldDefaultValue'];
          }
          if ('formGroupKeyName' in field) {
            formGroupKeyName = field['formGroupKeyName'];
          }
          if ('formGroupFromKeyName' in field) {
            formGroupFromKeyName = field['formGroupFromKeyName'];
          }
          const key = fieldType === 'date' ? formGroupFromKeyName : formGroupKeyName;
          const value = fieldType === 'date' ? fromFieldDefaultValue : fieldDefaultValue;
          if (value) {
            this.defaultQueryObject[key as string] = value as string;
          }
        }
      });
    });
    // Emit the filter query object to trigger data fetch
    this.filterService.filterFormValuesSubject.next(this.defaultQueryObject);
  }
}
