import { filterDetailsObject, filterFieldDetailsObject } from "../../../shared/components/filterdrawer/filterdrawer.interface";
import { historyScreenDetailsObject } from "../../../shared/components/history/history.component";
import { screenHeaderComponentDetailsObject } from "../../../shared/components/screenheader/screenheader.component";

export const listAPi = 'fup/phg/list';
export const excelExportApiPath = 'fup/phg/excelExport'
export const columns = ['Country', 'Week id', 'User', 'PHI id', 'PHI code', 'Version', 'Last step', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Date'];
export const filterDetails: filterDetailsObject = {
    screenName: 'phg',
    pagination: {
      pageNumber: 0,
      pageSize: 50
    }
  }
export const filterFieldDetails: filterFieldDetailsObject = {
    text: [
      {
        fieldName: "PHI code",
        fieldValue: "",
        formGroupKeyName: "phiCode"
      }
    ],
    dropDown: [
      {
        fieldName: "Country",
        fieldOptions: [],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'data',
        fieldValue: '',
        formGroupKeyName: "couCode",
        fieldDefaultValue: ""
      },
      {
        fieldName: "Last step",
        fieldOptions: [],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'id',
        fieldValue: '',
        formGroupKeyName: "monBmdId",
      },
      {
        fieldName: "Result",
        fieldOptions: [],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'data',
        fieldValue: "",
        formGroupKeyName: "result"
      },
      {
        fieldName: "Workteam",
        fieldOptions: [],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'id',
        fieldValue: "",
        formGroupKeyName: "wtmId"
      }
    ],
    radio: [
      {
        fieldName: "Status",
        fieldOptions: [],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'data',
        fieldValue: "",
        formGroupKeyName: "status",
      }
    ],
    date: [
      {
        fieldName: "Date range",
        fromFieldValue: "",
        toFieldValue: "",
        formGroupFromKeyName: "monStartDate",
        formGroupToKeyName: "monEndDate",
        fromFieldDefaultValue: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0]
      }
    ],
    dataList: [
      {
        fieldName: "User",
        fieldOptions: [],
        fieldOptionLabelKeyName: 'userName',
        fieldOptionValueKeyName: 'userName',
        fieldValue: '',
        formGroupKeyName: "usrUsername",
      }
    ]
  }
export const historyScreenDetails: historyScreenDetailsObject = {
    'screenTitle': 'PHG3 - Product hierarchy generation',
    'screenComponentName': 'product-hierarchy-generation',
    gridColumnNames: ['Step', 'Type', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Start date', 'End date']
  }
export const screenHeaderComponentDetails: screenHeaderComponentDetailsObject = {
    screenTitle: 'PHG1 - Product hierarchy generation- last steps',
    back: {
      actionIconName: 'arrow-standard-left',
      actionLabelName: 'Back',
    },
    download: {
      actionIconName: 'download',
      actionLabelName: 'Download',
    },
    filter: {
      actionIconName: 'filter',
      actionLabelName: 'Filter',
    },
    reset:{
        actionLabelName: 'Reset',
        isFilterReset: false
    },
    refresh:{
      actionIconName: 'refresh',
      actionLabelName: 'Refresh'
    }
  }
