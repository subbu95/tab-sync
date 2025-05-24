import { filterDetailsObject, filterFieldDetailsObject } from "../../../shared/components/filterdrawer/filterdrawer.interface";
import { historyScreenDetailsObject } from "../../../shared/components/history/history.component";
import { screenHeaderComponentDetailsObject } from "../../../shared/components/screenheader/screenheader.component";

export const listApi = 'fup/rbu/list';
export const excelExportApiPath = 'fup/rbu/excelExport';
export const columns = ['Country', 'Week id', 'Fup id', 'Fup Code', 'Version', 'Last step', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Date'];
export const filterDetails: filterDetailsObject = {
    screenName: 'rbu',
    pagination: {
        pageNumber: 0,
        pageSize: 50
    }
}
export const filterFieldDetails: filterFieldDetailsObject = {
    text: [
        {
            fieldName: "FUP Code",
            fieldValue: "",
            formGroupKeyName: "fupCode"
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
        {
            fieldName: "Workteam",
            fieldOptions: [],
            fieldOptionLabelKeyName: 'label',
            fieldOptionValueKeyName: 'id',
            fieldValue: "",
            formGroupKeyName: "wtmId"
        },
        {
            fieldName: "Resolution type",
            fieldOptions: [],
            fieldOptionLabelKeyName: 'label',
            fieldOptionValueKeyName: 'data',
            fieldValue: "",
            formGroupKeyName: "fphCode"
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
    ]
}
export const historyScreenDetails: historyScreenDetailsObject = {
    'screenTitle': 'RBU3 - Resolution by user',
    'screenComponentName': 'resolution-by-user',
    gridColumnNames: ['Step', 'Type', 'Session', 'Status', 'Result', 'Unix', 'Job id', 'Start date', 'End date']
}
export const screenHeaderComponentDetails: screenHeaderComponentDetailsObject = {
    screenTitle: 'RBU1 - Resolution by user-last steps',
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
