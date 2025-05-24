export interface viewTextFieldDetails {
  fieldName: string;
  fieldValue: string;
  formGroupKeyName: string;
  fieldDefaultValue?: string;
}
export interface viewCheckBoxFieldDetails {
  fieldName: string;
  fieldValue: boolean;
  formGroupKeyName: string;
  fieldDefaultValue?: boolean;
}
export interface viewDropDownFieldDetails {
  fieldName: string;
  // fieldOptions: { fdoId: number;[key: string]: string | number }[];
  fieldOptions: Record<string, string>[];
  fieldOptionLabelKeyName: string;
  fieldOptionValueKeyName: string;
  fieldValue: string;
  formGroupKeyName: string;
  fieldDefaultValue?: string;
}
export interface viewRadioFieldDetails {
  fieldName: string;
  fieldOptions: string[];
  fieldValue: string;
  formGroupKeyName: string;
  fieldDefaultValue?: string;
}
export interface viewDateFieldDetails {
  fieldName: string;
  fromFieldValue: string;
  toFieldValue: string;
  formGroupFromKeyName: string;
  formGroupToKeyName: string;
  fromFieldDefaultValue?: string;
  toFieldDefaultValue?: string;
}
export interface viewPopupFieldDetails {
  fieldName: string;
  fieldValue: string;
  formGroupKeyName: string;
  fieldDefaultValue?: string;
  popupOpenIconName: string;
}
//The filterFieldDetailsObject contains filter form field info of which screen is presented
export interface filterFieldDetailsObject {
  text?: viewTextFieldDetails[];
  date?: viewDateFieldDetails[];
  dropDown?: viewDropDownFieldDetails[];
  radio?: viewDropDownFieldDetails[];
  dataList?: viewDropDownFieldDetails[];
  checkBox?: viewCheckBoxFieldDetails[];
  textArea?: viewTextFieldDetails[];
  popup?: viewPopupFieldDetails[];
}
//The filterDetailsObject contains filter need info of which screen is presented
export interface filterDetailsObject {
  screenName: 'rin' | 'psr' | 'prg' | 'pmr' | 'phg' | 'osr' | 'mrg' | 'mcr' | 'ini' | 'rbu';
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}
