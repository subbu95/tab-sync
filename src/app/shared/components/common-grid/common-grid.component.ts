import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ButtonModule, DropDownModule, IconButtonModule, IconModule, ItemModule, MenuModule } from '@nielseniq/athena-core';
import { ScreenheaderbuttonclickService } from '../../../services/screenheaderbuttonclick.service';
import { CommonModule } from '@angular/common';
import { FilterapiService } from '../../../services/filterapi.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { CountryFlagPipe } from '../../pipe/country-flag.pipe';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../environments/environment';
import { LoaderService } from '../../../services/loader.service';
import { TruncatePipe } from '../../pipe/truncate.pipe';
import { UtilityService } from '../../../services/utility.service';
import { SessionStorageService } from '../../../services/session-storage.service';

@Component({
  selector: 'eclipse-common-grid',
  templateUrl: './common-grid.component.html',
  styleUrls: ['./common-grid.component.scss'],
  standalone: true,
  imports: [MatTableModule, IconButtonModule, CommonModule, MatPaginatorModule, MatSortModule, CountryFlagPipe, IconModule, MatTooltipModule, MenuModule, DropDownModule, ItemModule, TruncatePipe, ButtonModule],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CommonGridComponent implements OnChanges, AfterViewInit {
  @Input() columns: string[] = [];  // Column names
  @Input() data: any[] = []; // Data to display
  @Input() showAction: boolean = false;
  @Input() childColumns: string[] = [];
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = environment.pageSize;
  @Input() pageIndex: number = 0; // Page index passed from parent component
  @Input() enablePagination: boolean = true;
  @Input() enableSorting: boolean = true;
  @Input() screenCode: string = "";
  @Input() sortDirection: Record<string, "asc" | "desc" | ""> = {};

  // @Output() page: EventEmitter<PageEvent>
  @Output() pageChange = new EventEmitter<{ pageIndex: number, pageSize: number }>();
  @Output() sortChange = new EventEmitter<{ active: string, direction: string, sortDirection: any }>();
  @Output() rowClickEvent = new EventEmitter<{ rowDetails: any }>
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  pageSizeOptions = environment.pageSizeOptions;
  NIQLoaderImage = "";

  dataSource = new MatTableDataSource<any>(); // DataSource for Angular Material Table

  displayedColumns: string[] = [];

  menuSelectedColumns: string[] = [];

  gridColumns: string[] = [];

  expandedRow: { [key: string]: any[] } = {}; // Track the expanded row
  childData: { [key: string]: any[] } = {}; // Store child table data
  childDataLength: { [key: string]: any } = {};
  loadingChildData: { [key: number]: boolean } = {};

  columnsToDisplay = ['name', 'email', 'phone'];
  innerDisplayedColumns = ['street', 'zipCode', 'city'];
  expandedElement!: any | null;
  childTableLimit = signal(5);

  historyPageTitleMapping = {
    RBU: 'RBU3 - Resolution by user',
    INI: 'INI3 - Overall initialization',
    OSR: 'OSR3 - Product output set resolution',
    PSR: 'PSR3 - Product segment resolution',
    MCR: 'MCR3 - Mapped conversion resolution',
    PHG: 'PHG3 - Product hierarchy generation',
    PMR: 'PMR3 - Product mapped char resolution',
    MRG: 'MRG3 - Mapped char rule generation',
    PRG: 'PRG3 - Mapped char rule generation by POS',
    RIN: 'RIN3 - Rule induction',
  }
  historyScreenDetails: { [key: string]: any } = {};
  clickedRowIndex: number | null = null;
  // public sortDirection: Record<string, 'asc' | 'desc' | ''> = {};

  constructor(private filterService: FilterapiService, private screenHeaderActionClick: ScreenheaderbuttonclickService,
    private loaderService: LoaderService, private cdr: ChangeDetectorRef,
    private utilService: UtilityService, public sessionStorageService: SessionStorageService) {
    this.NIQLoaderImage = this.loaderService.getNIQLoader();
  }

  ngOnInit() {
    this.gridColumns = this.columns;
    this.menuSelectedColumns = this.columns;
    this.clearChildData();  
  }

  getSelectedColumns(event: string[]) {
    if (event.includes('Select all columns')) {
      event = this.gridColumns;
    }
    const displayedColumns = event.sort((a, b) => this.gridColumns.indexOf(a) - this.gridColumns.indexOf(b));
    this.sessionStorageService.set(this.screenCode, displayedColumns);
    this.menuSelectedColumns = this.sessionStorageService.get(this.screenCode).split(',');
  }

  applySelectedColumnsToGrid() {
    this.columns = this.menuSelectedColumns;
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator; // Connect paginator
    if (this.enablePagination && this.paginator) {
      this.paginator.pageSize = this.pageSize; // Set initial page size
      this.paginator.pageIndex = this.pageIndex; // Set initial page index
    }

    if (this.enableSorting && this.sort) {
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource.sort = null;
    }

    if (this.sessionStorageService.get(this.screenCode)) {
      this.menuSelectedColumns = this.sessionStorageService.get(this.screenCode).split(',');
      this.columns = this.menuSelectedColumns;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalRecords'] && this.paginator) {
      this.paginator.length = this.totalRecords; // Update paginator length
    }

    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
      this.displayedColumns = [...this.columns]; // Ensure correct binding
    }

    // if (this.paginator) {
    //   this.paginator.firstPage();
    // }    
  }

  keyMapping(columnName: string): string {
    if (columnName.split(" ").length > 1) {
      columnName = columnName.replace(" ", "_");
    }
    columnName = columnName.toLocaleLowerCase();
    return columnName;
  }

  viewMore(row: any, event: Event) {
    event.stopPropagation();
    const { monId } = row;
    this.screenHeaderActionClick.emitListActionClick('history', this.historyScreenDetails[monId]);
  }

  toggleChildTable(row: any, event: Event) {
    this.clickedRowIndex = null;
    event.stopPropagation();
    row.expanded = !row.expanded;
    if (!row || row.length === 0) return;

    if (row.monId in this.expandedRow) {
      delete this.expandedRow[row.monId]; // Collapse row
    } else {
      this.expandedRow[row.monId] = row; // Expand row
      if (!this.childData[row.monId]) {
        this.getHistoryData(row);
      }
    }
  }

  getHistoryData(data: any) {
    let { country, week_id, fphCode, fup_id, week, monId, session } = data;
    this.historyScreenDetails[monId] = {};
    if (fphCode === undefined) {
      fphCode = this.screenCode.toLocaleUpperCase();
    }
    this.loadingChildData[monId] = true;
    let queryObject: Record<string, string>;
    this.historyScreenDetails[monId]['filterFieldObject'] = { 'Country': country, 'Week': week };
    if (fphCode === 'INI') {
      queryObject = { 'couCode': country as string, 'tprId': week_id as string }
    } else {
      const keyMapping = {
        OSR: 'posId',
        PSR: 'prsId',
        MCR: 'cvnId',
        PHG: 'phiId',
        PMR: 'macId',
        MRG: 'macId',
        PRG: 'macId',
        RIN: 'macId',
      };
      let fphCodeKey = keyMapping[fphCode as keyof typeof keyMapping];
      queryObject = { 'tprId': week_id as string };
      if (fup_id === undefined) {
        fup_id = data[fphCodeKey.split('I')[0].toLocaleLowerCase() + '_id'] as string;
      }
      if (fphCode === 'RIN' && session) {
        queryObject['session'] = session;
      }
      queryObject[fphCodeKey] = fup_id as string;
      fphCodeKey = fphCodeKey.split('I')[0].toLocaleUpperCase() + ' id';
      this.historyScreenDetails[monId]['filterFieldObject'][fphCodeKey] = fup_id;
    }
    this.historyScreenDetails[monId]['screenTitle'] = `${this.historyPageTitleMapping[fphCode as keyof typeof this.historyPageTitleMapping]}`
    const sub = this.filterService.filterFetch(`fup/${fphCode.toString().toLocaleLowerCase()}/history`,
      // { 'couCode': 'IT', 'tprId': '1353' }).subscribe({
      queryObject).subscribe({
        next: (data: any) => {
          this.loadingChildData[monId] = false;
          this.historyScreenDetails[monId]['gridDataObject'] = data && Object.hasOwn(data, 'body') &&
            Object.hasOwn(data['body'], 'listOfHistoryResponseDto') && data['body']['listOfHistoryResponseDto'] &&
            data['body']['listOfHistoryResponseDto'].length > 0 ? data['body']['listOfHistoryResponseDto'] : [];
          this.childDataLength[monId] = this.historyScreenDetails[monId]['gridDataObject'].length;
          this.childData[monId] = this.historyScreenDetails[monId]['gridDataObject'].slice(0, 5);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loadingChildData[monId] = false;
          console.log(err);
        }
      });
  }

  onPaginateChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }


  onSortChange(event: Sort) {
    Object.keys(this.sortDirection).forEach(key => {
      if (this.sortDirection[key]) {
        this.sortDirection[key] = '';
      }
    });
    this.sortDirection[event.active] = event.direction;
    console.log("this.sortDirection::", this.sortDirection);
    this.sortChange.emit({ active: event.direction === '' ? '' : event.active, direction: event.direction, sortDirection: this.sortDirection });
  }

  rowClick(row: any, event: Event) {
    event.stopPropagation();
    this.clickedRowIndex = row && row.monId ? row.monId : null;
    this.rowClickEvent.emit({ rowDetails: row });
  }
  toggleRow(row: any) {
    if (!row || row.length === 0) return;
    this.expandedRow[row.monId] = this.expandedRow[row.monId] === row.monId ? null : row;
    this.cdr.detectChanges();
  }

  clearChildData(monId?: any) {
    if (this.childData[monId]) {
      this.childData[monId] = [];
      this.childDataLength[monId] = [];
      this.expandedRow[monId] = [];
      this.historyScreenDetails[monId] = []
    } else {
      this.childData = {};
      this.childDataLength = {};
      this.expandedRow = {};
      this.historyScreenDetails = {};
    }
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.utilService.openSnackBar(
        'large',
        'success',
        'Text should be copied.',
        'success',
      );
    })
  }
}