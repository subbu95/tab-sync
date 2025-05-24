import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconButtonModule } from '@nielseniq/athena-core';
import { CommonModule } from '@angular/common';
import { CommonGridComponent } from '../common-grid/common-grid.component';
import { CountryFlagPipe } from '../../pipe/country-flag.pipe';
import { CONSTANTS } from '../../../../assets/app.constants';
import { EclipseAthenaDialogComponent } from '../eclipse-athena-dialog/eclipse-athena-dialog.component';

export interface historyScreenDetailsObject {
  screenTitle: 'MRG3 - Mapped char rule generation' | 'INI3 - Overall initialization' | 'PMR3 - Product mapped char resolution' |
  'PRG3 - Mapped char rule generation by POS' | 'PSR3 - Product segment resolution' | 'MCR3 - Mapped conversion resolution' |
  'PHG3 - Product hierarchy generation' | 'OSR3 - Product output set resolution' | 'RIN3 - Rule induction' | 'RBU3 - Resolution by user' | string;
  filterFieldObject?: Record<string, string | number>;
  gridColumnNames?: string[];
  gridDataObject?: object[];
  screenComponentName: 'overall-initialisation' | 'product-mapped-char-resolution' | 'mapped-conversation-resolution' |
  'product-hierarchy-generation' | 'product-mapped-char-rule-generation' | 'product-mapped-char-rule-generation-by-pos' |
  'product-output-set-resolution' | 'product-segment-resolution' | 'rule-induction' | 'resolution-by-user';
}
@Component({
  selector: 'eclipse-history',
  standalone: true,
  imports: [IconButtonModule, CommonModule, CommonGridComponent, CountryFlagPipe, EclipseAthenaDialogComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class HistoryScreenComponent implements OnInit {
  @ViewChild(EclipseAthenaDialogComponent, { static: false }) child?: EclipseAthenaDialogComponent;
  public historyScreenDetails!: historyScreenDetailsObject; // Input for history screen
  monId!: number;
  title = CONSTANTS.DETAILS_TITLE;
  detailsPath: string = CONSTANTS.FUP.INI.STEP_DETAILS_API_PATH;
  defaultQueryOfScreen = "";

  constructor(private route: ActivatedRoute, private router: Router) { }
  ngOnInit() {
    //Get the history screen need data from navigation query params
    this.route.queryParams.subscribe(params => {
      params = JSON.parse(params['data']);
      if (params) {
        this.historyScreenDetails = {
          screenTitle: params['screenTitle'] ? params['screenTitle'] : '',
          screenComponentName: params['screenComponentName'] ? params['screenComponentName'] : '',
          filterFieldObject: params['filterFieldObject'] ? params['filterFieldObject'] : {},
          gridDataObject: params['gridDataObject'] ? params['gridDataObject'] : [],
          gridColumnNames: params['gridColumnNames'] ? params['gridColumnNames'] : []
        };
        this.defaultQueryOfScreen = params['defaultQuery'] ? params['defaultQuery'] : "";
      }
    });
  }
  //Return back to the component
  goBack(): void {
    this.router.navigate([`follow-up/${this.historyScreenDetails['screenComponentName']}`],
      { queryParams: { data: JSON.stringify({ isReturnTo: true, defaultQuery: this.defaultQueryOfScreen }) }, skipLocationChange: true });
  }
  //Give the keys of the object, also used in the HTML to display filter fields
  objectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  onRowClick(event: { rowDetails: any }) {
    this.monId = event.rowDetails.monId;
    this.child?.openDialog(this.monId);
  }

  public deleteConfirmation(msg: string) {
    console.log("delete", msg);
  }

}
