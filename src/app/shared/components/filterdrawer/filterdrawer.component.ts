import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import {
  AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule,
  ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { AutocompleteModule, CheckboxModule, ChipModule, DialogComponent, DialogModule, IconModule, RadioButtonModule, SidePanelModule, SnackbarModule, SnackbarService, TextFieldModule }
  from '@nielseniq/athena-core';
import moment from 'moment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CommonModule } from '@angular/common';
import { catchError, debounceTime, of, Subject, Subscription, switchMap } from 'rxjs';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { FormatDataPipe } from '../../pipe/formatdata.pipe';
import { ApiResponse, FilterapiService } from '../../../services/filterapi.service';
import { DatalistComponent } from '../datalist/datalist.component';
import { filterDetailsObject, filterFieldDetailsObject, viewCheckBoxFieldDetails, viewDateFieldDetails, viewDropDownFieldDetails } from './filterdrawer.interface';

// Define a custom date format
export const MY_DATE_FORMATS = {
  display: {
    dateInput: 'yyyy-MM-DD',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
  parse: {
    dateInput: 'yyyy-MM-DD',
  },
};

@Component({
  selector: 'eclipse-filterdrawer',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    TextFieldModule,
    RadioButtonModule,
    IconModule,
    SidePanelModule,
    SnackbarModule,
    CheckboxModule,
    DialogModule,
    ChipModule,
    DropdownComponent,
    DatalistComponent,
    AutocompleteModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATE_FORMATS
    }
  ],
  templateUrl: './filterdrawer.component.html',
  styleUrl: './filterdrawer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FilterdrawerComponent implements OnInit, OnDestroy {
  @Input() filterFieldDetails!: filterFieldDetailsObject; // Input for filter field details (text, dropdown, date, etc.)
  @Input() filterDetails!: filterDetailsObject; // Input for filter details (screen name & others etc.)
  @Output() close = new EventEmitter<object>(); // Event emitter for closing the popup
  filterForm!: FormGroup; // Form group for handling the filter form
  formGroup!: Record<string, FormControl>; // Object to hold form controls
  dataFormatPipe = new FormatDataPipe(); // Format data pipe for transforming field names
  filterSubscription: Subscription[] = []; // Subscription array for unsubscribing on component destroy
  @ViewChild('popupFieldDialogBox', { static: true }) popupFieldDialogBox!: DialogComponent;
  @ViewChildren('filterdropdownField') filterdropdownFields!: QueryList <ElementRef>;
  filterdropdownWidth : string = '';
  dateFieldMinandMax: { [key: string]: string } = {};
  private searchSubject: Subject<{ event: string, field: viewDropDownFieldDetails }> = new Subject();
  constructor(public filterService: FilterapiService, public filterFormBuilder: FormBuilder, public filterSnackbar: SnackbarService) { }

  ngOnInit(): void {
    this.initializeForm(); // Initialize the form when the component is created
    this.fetchFieldOptions(); // Fetch dropdown options
    // Listen to the searchSubject and apply debounceTime to prevent too many API calls
    const sub = this.searchSubject.pipe(
      debounceTime(500), // Wait for 500ms after the last change before emitting the value
      switchMap(({ event, field }) => {
        // Call the service with both event and field details
        return this.filterService.getFieldOptions({ userName: event }, field['fieldName']).pipe(
          // Use 'of' to emit the options and field as an observable
          switchMap(options => of({ options, field }))  // Emit the object { options, field } as an observable
        );
      }),
      catchError((err) => {
        console.error(err);
        return of({ options: [], field: null }); // Return a default value in case of error
      })
    ).subscribe(({ options, field }) => {
      // Directly update the field options in the field parameter
      if (field) {
        field.fieldOptions = options;
      }
    });
    this.filterSubscription.push(sub);
  }
  // Fetch dropdown options
  fetchFieldOptions(): void {
    (Object.keys(this.filterFieldDetails) as (keyof filterFieldDetailsObject)[]).forEach((fieldType) => {
      if (fieldType === 'dropDown' || fieldType === 'radio' || fieldType === 'dataList') {
        this.filterFieldDetails[fieldType]?.forEach((field) => {
          if (field.fieldOptions?.length === 0) {
            const fieldName = field.fieldName;
            let requestPayload: Object = this.dataFormatPipe.transform(fieldName) === 'laststep' ? { screenName: this.filterDetails.screenName } : {};
            if (fieldType !== 'dataList') {
              //Get the field option subscripe on sub local varaible & pushed it to filter subscription global varaible
              const sub = this.filterService.getFieldOptions(requestPayload, fieldName).subscribe((options) => {
                field.fieldOptions = options;
                this.updateField(field, fieldType);
              });
              this.filterSubscription.push(sub);
            }
          }
        });
      }
    });
  }
  // Update the form control based on the field type and options
  updateField(field: viewDropDownFieldDetails, fieldType: keyof filterFieldDetailsObject): void {
    let defaultValueIndex = -1;
    // Only check 'fieldOptions' if the field has it
    if (field.fieldOptions?.length > 0) {
      if (field.fieldDefaultValue) {
        defaultValueIndex = this.findOptionIndex(field.fieldOptions, field.fieldOptionValueKeyName, field.fieldDefaultValue);
      }
    }
    this.onFieldOptionChange(fieldType, defaultValueIndex > -1 ? field.fieldOptions[defaultValueIndex][field['fieldOptionValueKeyName']] : null, field)
  }

  // Initialize the form
  initializeForm(): void {
    this.formGroup = {}; // Initialize the form group object
    // Common initialization logic for different field types
    Object.keys(this.filterFieldDetails).forEach(fieldType => {
      if (Object.hasOwn(this.filterFieldDetails, fieldType)) {
        const fieldDetails = this.filterFieldDetails[fieldType as keyof typeof this.filterFieldDetails];
        if (fieldDetails) {
          fieldDetails.forEach((field) => {
            let formGroupKey;
            let fieldDefaultValue;
            let fieldOptions;
            let valueKey;
            if ('formGroupKeyName' in field) {
              formGroupKey = field['formGroupKeyName'];
            }
            if ('fieldDefaultValue' in field) {
              fieldDefaultValue = field['fieldDefaultValue'];
            }
            if ('fieldOptions' in field) {
              fieldOptions = field['fieldOptions'];
            }
            fieldOptions = fieldOptions as Record<string, string | number>[];
            if ('fieldOptionValueKeyName' in field) {
              valueKey = field['fieldOptionValueKeyName'];
            }
            if ('formGroupKeyName' in field) {
              formGroupKey = field['formGroupKeyName'];
            }
            if (fieldType === 'text' || fieldType === 'dataList' || fieldType === 'radio'
              || fieldType === 'checkBox' || fieldType === 'textArea' || fieldType === 'popup') {
              this.formGroup[formGroupKey as string] = new FormControl({
                value: fieldType === 'radio' && this.getFieldDefaultValue(fieldDefaultValue as string) === null ? '' : this.getFieldDefaultValue(fieldDefaultValue as string),
                disabled: fieldType === 'popup' ? true : false
              });
            }
            // Handle dropdown fields specifically
            if (fieldType === 'dropDown') {
              let defaultValueIndex = -1;
              if (fieldDefaultValue) {
                defaultValueIndex = this.findOptionIndex(fieldOptions, valueKey as string, fieldDefaultValue as string);
              }
              this.formGroup[formGroupKey as string] = new FormControl({
                value: defaultValueIndex > -1
                  ? fieldOptions[defaultValueIndex][valueKey as string] : null, disabled: false
              });
            }
            // Handle date fields with validation
            if (fieldType === 'date') {
              const dateField: viewDateFieldDetails = field as viewDateFieldDetails;
              this.setupDateFieldValidation(dateField);
            }
          });
        }
      }
    })

    // Bind the form group to the form
    this.filterForm = this.filterFormBuilder.group(this.formGroup);
  }
  // Get the default value of a field
  getFieldDefaultValue(fieldDefaultValue: string): string | boolean | null {
    return fieldDefaultValue ? fieldDefaultValue : null;
  }
  // Set up date field validation for "from" and "to" fields
  setupDateFieldValidation(field: viewDateFieldDetails): void {
    this.formGroup[field['formGroupFromKeyName']] = new FormControl(
      field['fromFieldDefaultValue'] || null,
      [Validators.required, this.sameDateValidator(field['formGroupToKeyName']),
      this.toDateGreaterThanFromDate(field['formGroupFromKeyName'], field['formGroupToKeyName'])]
    );
    this.formGroup[field['formGroupToKeyName']] = new FormControl(
      field['toFieldDefaultValue'] || null,
      [this.sameDateValidator(field['formGroupFromKeyName']),
      this.toDateGreaterThanFromDate(field['formGroupFromKeyName'], field['formGroupToKeyName'])]
    );
    this.dateFieldMinandMax[field['formGroupFromKeyName']] = new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0];
    this.dateFieldMinandMax[field['formGroupToKeyName']] = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  }
  // Finds the index of an object in an array based on a key-value match
  findOptionIndex(objectArray: Record<string, string | number>[], key: string, value: string | number | undefined): number {
    return objectArray.findIndex(item => item[key].toString() === value?.toString());
  }
  // Validator to check if the "From" and "To" date fields are the same
  sameDateValidator(key: string): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value && this.filterForm) {
        const fromORToDate = this.filterForm.get(key)?.value;
        if (fromORToDate && moment(control.value).isSame(moment(fromORToDate), 'day')) {
          return { sameDate: true }; // Return error if the dates are the same
        }
      }
      return null;
    };
  }
  // Validator to check if the "To" date is after the "From" date
  toDateGreaterThanFromDate(fromDateKey: string, toDateKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && this.filterForm) {
        const fromDate = this.filterForm.get(fromDateKey)?.value;
        const toDate = this.filterForm.get(toDateKey)?.value;
        if (fromDate && toDate) {
          const momentFromDate = moment(fromDate);
          const momentToDate = moment(toDate);
          if (momentToDate.isBefore(momentFromDate, 'day')) {
            return { lessThanFromDate: true }; // Return error if To date is before From date
          }
        }
      }
      return null;
    };
  }
  onDateFieldChange(fromKey: string, toKey: string) {
    if (this.filterForm.get(toKey)?.value) {
      this.dateFieldMinandMax[fromKey] = this.filterForm.get(toKey)?.value;
    } else {
      this.dateFieldMinandMax[fromKey] = new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0];
    }
    if (this.filterForm.get(fromKey)?.value) {
      // Create a new Date object using the formatted string
      const date = new Date(this.filterForm.get(fromKey)?.value);
      // Add one day
      date.setDate(date.getDate() + 1);
      // Format the date back to "YYYY-DD-MM" format
      const newDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      this.dateFieldMinandMax[toKey] = newDateString;
    } else {
      this.dateFieldMinandMax[toKey] = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    }
  }
  // Applies filters by gathering values from the form and emitting them
  applyFilters(): void {
    const filterValues = JSON.parse(JSON.stringify(this.filterForm.value));
    // Handle date fields and format them properly
    if (this.filterFieldDetails.dropDown) {
      this.filterFieldDetails.dropDown?.forEach(dropDownField => {
        const dropDownFieldValue = dropDownField['fieldOptions'].find(option =>
          option[dropDownField['fieldOptionValueKeyName']] === filterValues[dropDownField['formGroupKeyName']])?.[dropDownField['fieldOptionValueKeyName']];
        filterValues[dropDownField['formGroupKeyName']] = (typeof dropDownFieldValue === 'undefined') ? null : dropDownFieldValue;
      });
    }
    if (this.filterFieldDetails.date) {
      this.filterFieldDetails.date?.forEach(dateField => {
        const fromControl = this.filterForm.get(dateField['formGroupFromKeyName']);
        const toControl = this.filterForm.get(dateField['formGroupToKeyName']);
        if (fromControl?.hasError('required')) {
          this.filterForm.get(dateField['formGroupFromKeyName'])?.setValue(dateField['fromFieldDefaultValue']);
          filterValues[dateField['formGroupFromKeyName']] = dateField['fromFieldDefaultValue'];
          return;
        }
        if (fromControl?.value && toControl?.value && moment(toControl.value).isSame(moment(fromControl.value), 'day')) {
          this.filterSnackbar.open('large', 'error', `${dateField['fieldName']} field to Date cannot be the same as from Date.`, 'filter', { 'dismissAfter': 5000 });
          return;
        }
        if (fromControl?.value && toControl?.value && moment(toControl.value).isBefore(moment(fromControl.value))) {
          this.filterSnackbar.open('large', 'error', `${dateField['fieldName']} field to Date cannot be earlier than From Date.`, 'filter', { 'dismissAfter': 5000 });
          return;
        }
        filterValues[dateField['formGroupFromKeyName']] = moment(filterValues[dateField['formGroupFromKeyName']]).format('YYYY-MM-DD');
        filterValues[dateField['formGroupToKeyName']] = filterValues[dateField['formGroupToKeyName']] ?
          moment(filterValues[dateField['formGroupToKeyName']]).format('YYYY-MM-DD') : null;
      });
    }
    for (const key in filterValues) {
      if (filterValues[key] === null || filterValues[key] === "") {
        delete filterValues[key];
      }
    }
    // filterValues['monBmdIdFilter'] = "50"
    // filterValues['sortedByFilter'] = "TPR_ID DESC"
    filterValues['pageNumber'] = this.filterDetails['pagination']['pageNumber'] > -1 ? this.filterDetails['pagination']['pageNumber'] : 0; // Hard coded for getting response we need change with actual value
    filterValues['pageSize'] = this.filterDetails['pagination']['pageSize'] > -1 ? this.filterDetails['pagination']['pageSize'] : 50;

    if (this.filterForm.valid) {
      // Add the filter query object to behaviour subject
      this.filterService.filterFormValuesSubject.next(filterValues);
      this.closePopup();
    }
  }
  // Resets the filter form to its initial state
  resetFilters(isFromGrid?:boolean): void {
    this.initializeForm();
    if(Object.keys(this.filterService.filterFormValuesSubject.value).length > 0 && !isFromGrid){
      const filterObject: {[key:string]: any } = this.filterService.filterFormValuesSubject.value;
      const nonFilterFormKeys = ['pageNumber', 'pageSize', 'sortBy', 'orderBy'];
      nonFilterFormKeys.forEach(key=>{
        delete filterObject[key];
      });
      this.filterForm.patchValue(filterObject);
    } else {
      this.filterForm.reset(this.filterForm.value);
    }
  }
  // Emits the close event to indicate that the filter modal should be closed
  closePopup(data?: ApiResponse): void {
    this.close.emit();
  }
  // Based on the dropdown and datalist field change, set the change value to form
  onFieldOptionChange(fieldType: string, event: string | object | undefined | null | number | Event, field: viewDropDownFieldDetails) {
    switch (fieldType) {
      case 'dropDown':
        this.filterForm.get(field['formGroupKeyName'])?.setValue(event);
        break;
      case 'dataList':
        if (typeof (event) === 'object' && event !== null && Object.hasOwn(event, field['fieldOptionValueKeyName'])
          && (event as Record<string, string | number>)[field['fieldOptionValueKeyName']]) {
          this.filterForm.get(field['formGroupKeyName'])?.setValue((event as Record<string, string | number>)[field['fieldOptionValueKeyName']])
        } else if (!event || event === undefined || typeof (event) === 'object' && Object.keys(event).length === 0 ) {
          this.filterForm.get(field['formGroupKeyName'])?.setValue(null);
          field.fieldOptions = [];
        }
        break;
    }
  }
  checkedChange(event: boolean, field: viewCheckBoxFieldDetails) {
    field['fieldValue'] = event;
    this.filterForm.get(field['formGroupKeyName'])?.setValue(field['fieldValue']);
  }
  // Clears the value of a specific filter field
  clearFilterFields(key: string, defaultValue?: string | number) {
    if (defaultValue) {
      this.filterForm.get(key)?.setValue(defaultValue);
    } else {
      this.filterForm.get(key)?.setValue(null);
    }
  }
  // Unsubscribes from any active subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.filterSubscription.forEach(sub => sub.unsubscribe());
  }
  // onCloseDialogEvent(): void {
  //   console.log('dialog was closed by user');
  //   // handle dialog close event
  // }
  //Based on the datalist key value change, fetch and shown the user details
  onDataListValueChange(event: string, field: viewDropDownFieldDetails) {
    if (typeof (event) === 'string' && event.length >= 4) {
      //Get the user field option subscripe on sub local varaible & pushed it to filter subscription global varaible
      this.searchSubject.next({ event, field });
    }
    else if (typeof (event) === 'string' && event.length === 0) {
      field.fieldOptions = [];
  }
}
  // popupFieldDialogOpen() {
  //   this.popupFieldDialogBox.open();
  // }
  ngAfterViewChecked  () : void {
      this.filterdropdownFields?.forEach((field) => {
        const width = getComputedStyle(field.nativeElement).width;
        this.filterdropdownWidth = width;
      });
    }
}
