import { environment } from "../../../../environments/environment";
import { filterDetailsObject, filterFieldDetailsObject } from "../../../shared/components/filterdrawer/filterdrawer.interface";
import { historyScreenDetailsObject } from "../../../shared/components/history/history.component";
import { screenHeaderComponentDetailsObject } from "../../../shared/components/screenheader/screenheader.component";

export const listApi = 'fup/ini/list';
export const excelExportApiPath = 'fup/ini/excelExport'
export const columns = ['Country', 'Week id', 'User', 'Last step', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Date'];
export const filterDetails: filterDetailsObject = {
    screenName: 'ini',
    pagination: {
        pageNumber: 0,
        pageSize: environment.pageSize
    }
}
export const filterFieldDetails: filterFieldDetailsObject = {
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
            fieldName: "last step",
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
    'screenTitle': 'INI3 - Overall initialization',
    'screenComponentName': 'overall-initialisation',
    gridColumnNames: ['Step', 'Type', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Start date', 'End date']
}
export const screenHeaderComponentDetails: screenHeaderComponentDetailsObject = {
    screenTitle: 'INI1 - Overall initialization-last steps',
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