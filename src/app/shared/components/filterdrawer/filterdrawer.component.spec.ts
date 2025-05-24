import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl } from '@angular/forms';
import { SnackbarService } from '@nielseniq/athena-core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterdrawerComponent } from './filterdrawer.component';
import { DropdownOption, FilterapiService } from '../../../services/filterapi.service';
import { viewCheckBoxFieldDetails, viewDropDownFieldDetails } from './filterdrawer.interface';
// import * as moment from 'moment';
describe('FiltersearchComponent', () => {
  let component: FilterdrawerComponent;
  let fixture: ComponentFixture<FilterdrawerComponent>;
  let filterapiServiceSpy: jasmine.SpyObj<FilterapiService>;
  let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
  let filterFormBuilder: FormBuilder;
  beforeEach(async () => {
    filterapiServiceSpy = jasmine.createSpyObj('FilterapiService', ['getFieldOptions', 'filterFetch']);
    filterapiServiceSpy.filterFormValuesSubject = new BehaviorSubject<object>({});
    snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['open']);
    filterFormBuilder = new FormBuilder();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
      providers: [
        FormBuilder,
        { provide: FilterapiService, useValue: filterapiServiceSpy },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilterdrawerComponent);
    component = fixture.componentInstance;
    // Initialize filterFieldDetails for test setup
    component.filterFieldDetails = {
      text: [{ fieldName: 'testText', fieldValue: 'sample', formGroupKeyName: 'testtext' }],
      dataList: [{ fieldName: 'testDataList', fieldValue: 'sample', formGroupKeyName: 'testdatalist', fieldOptions: [{ fdoId: '1', label: 'Option1' }], fieldOptionValueKeyName: 'label', fieldOptionLabelKeyName: 'label' }],
      dropDown: [{
        fieldName: 'testDropdown', fieldOptions: [{ fdoId: '1', label: 'Option1' }], fieldOptionValueKeyName: 'label', fieldOptionLabelKeyName: 'label', fieldValue: 'Option1', formGroupKeyName: 'testdropdown'
      }],
      radio: [{ fieldName: 'testRadio', fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionValueKeyName: 'label', fieldOptionLabelKeyName: 'label', fieldValue: 'OptionA', formGroupKeyName: 'testradio' }],
      date: [{
        fieldName: 'testDate', fromFieldValue: '', toFieldValue: '', formGroupFromKeyName: 'testdate_from', formGroupToKeyName: 'testdate_to'
      }],
      checkBox: [{ fieldName: 'testCheckBox', fieldValue: false, formGroupKeyName: 'testcheckbox' }],
      textArea: [{ fieldName: 'testTextArea', fieldValue: '', formGroupKeyName: 'testtextarea' }]
    };
    component.filterDetails = {
      screenName: 'ini',
      pagination: {
        pageNumber: 0,
        pageSize: 50
      }
    };
    // Initialize formGroup with controls based on formGroupKeyNames
    component.formGroup = {
      testtext: new FormControl(null),
      testdatalist: new FormControl(null),
      testdropdown: new FormControl(null),
      testradio: new FormControl(''),
      testdate_from: new FormControl(null),
      testdate_to: new FormControl(null),
      testcheckbox: new FormControl(null),
      testtextarea: new FormControl(null)
    };
    component.filterForm = filterFormBuilder.group(component.formGroup);
    component.ngOnInit();
    fixture.detectChanges();
  });
  describe('fetchFieldOptions', () => {
    it('should update dropdown field options and call updateField after fetching', async () => {
      const dropDownField: viewDropDownFieldDetails = {
        fieldName: 'testDropdown',
        fieldOptions: [], // Initially empty options
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'Option1',
        formGroupKeyName: 'testdropdown'
      };
      // Create a spy for updateField method
      spyOn(component, 'updateField');
      // Simulate the response of getFieldOptions to return some options
      filterapiServiceSpy.getFieldOptions.and.returnValue(of([{ fdoId: '1', label: 'Option1' }, { fdoId: '2', label: 'Option2' }]));
      // Initially set the dropdown field in filterFieldDetails
      component.filterFieldDetails.dropDown = [dropDownField];
      // Trigger the fetchFieldOptions method
      await component.fetchFieldOptions();
      // Update the fixture after async operation
      fixture.detectChanges();
      // Check if the fieldOptions were updated with the fetched options
      expect(dropDownField.fieldOptions.length).toBeGreaterThan(0);
      expect(dropDownField.fieldOptions[0]['label']).toBe('Option1');
      expect(dropDownField.fieldOptions[1]['label']).toBe('Option2');
      // Ensure that updateField was called with the correct argument (dropDownField)
      expect(component.updateField).toHaveBeenCalledWith(dropDownField, 'dropDown');
    });
    it('should handle error if dropdown options fetch fails', async () => {
      filterapiServiceSpy.getFieldOptions.and.returnValue(throwError('Error fetching options'));
      try {
        await component.fetchFieldOptions();
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
    it('should set dropdown options correctly from the service', async () => {
      let dropDownField: viewDropDownFieldDetails;
      filterapiServiceSpy.getFieldOptions.and.returnValue(of([{ fdoId: '1', label: 'Option1' }]));
      await component.fetchFieldOptions();
      fixture.detectChanges();
      if (component.filterFieldDetails.dropDown && component.filterFieldDetails.dropDown[0]) {
        dropDownField = component.filterFieldDetails.dropDown[0];
        expect(dropDownField.fieldOptions.length).toBeGreaterThan(0);
        expect(dropDownField.fieldOptions[0]['label']).toBe('Option1');
      }
    });
    it('should handle error if dropdown options fetch fails', async () => {
      filterapiServiceSpy.getFieldOptions.and.returnValue(throwError('Error fetching options'));
      try {
        await component.fetchFieldOptions();
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
  describe('updateField', () => {
    it('should update the dropdown field with the default value if provided', async () => {
      const dropDownField: viewDropDownFieldDetails = {
        fieldName: 'testDropdown',
        fieldOptions: [{ fdoId: '1', label: 'Option1' }, { fdoId: '2', label: 'Option2' }],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'Option2',
        formGroupKeyName: 'testdropdown',
        fieldDefaultValue: 'Option2'
      };
      // Simulate the form control setup
      component.filterForm.get('testdropdown')?.setValue(1); // Set initial value
      component.updateField(dropDownField, 'dropDown');
      fixture.detectChanges();
      // The default value index should be 1 (index of 'Option2')
      expect(component.filterForm.get('testdropdown')?.value).toBe('Option2'); // Index of 'Option2'
    });
    it('should set the form control value to null if no matching default value is found', async () => {
      const dropDownField: viewDropDownFieldDetails = {
        fieldName: 'testDropdown',
        fieldOptions: [{ fdoId: '1', label: 'Option1' }, { fdoId: '2', label: 'Option2' }],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'Option2',
        formGroupKeyName: 'testdropdown',
        fieldDefaultValue: 'NonExistentOption'
      };
      component.updateField(dropDownField, 'dropDown');
      fixture.detectChanges();
      // Since there is no matching default value, the value should be null
      expect(component.filterForm.get('testdropdown')?.value).toBeNull();
    });
    it('should update the dropdown field with the default value if provided', async () => {
      const dataListfield: viewDropDownFieldDetails = {
        fieldName: 'testDataList',
        fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionA',
        formGroupKeyName: 'testdatalist',
        fieldDefaultValue: 'OptionB'  // Default value is OptionB
      };
      // Assume defaultValueIndex for 'OptionB' is 1
      const defaultValueIndex = dataListfield.fieldDefaultValue ? component.findOptionIndex(dataListfield.fieldOptions, 'label', dataListfield.fieldDefaultValue) : -1;
      // Initialize the form control with null or default value
      component.formGroup[dataListfield.formGroupKeyName] = new FormControl(
        defaultValueIndex > -1 ? dataListfield.fieldOptions[defaultValueIndex] : null
      );
      component.filterForm.get('testdatalist')?.setValue('OptionB');
      component.updateField(dataListfield, 'dataList');
      fixture.detectChanges();
      expect(component.filterForm.get('testdatalist')?.value).toBe('OptionB'); // Index of 'Option2'
    });
    it('should set the radio button form control value to the default value when defaultValueIndex is valid', () => {
      const field: viewDropDownFieldDetails = {
        fieldName: 'testRadio',
        fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionA',
        formGroupKeyName: 'testradio',
        fieldDefaultValue: 'OptionB'  // Default value is OptionB
      };
      // Assume defaultValueIndex for 'OptionB' is 1
      const defaultValueIndex = field.fieldDefaultValue ? component.findOptionIndex(field.fieldOptions, 'label', field.fieldDefaultValue) : -1;
      // Initialize the form control with null or default value
      component.formGroup[field.formGroupKeyName] = new FormControl(
        defaultValueIndex > -1 ? field.fieldOptions[defaultValueIndex] : null
      );
      component.filterForm.get('testradio')?.setValue('OptionB'); //Set initial value
      component.updateField(field, 'radio');
      fixture.detectChanges();
      // Check if the FormControl for 'testradio' is set to 'OptionB'
      expect(component.filterForm.get('testradio')?.value).toBe('OptionB');
    });
    it('should set the radio button form control value to null when defaultValueIndex is invalid (-1)', () => {
      const radioField: viewDropDownFieldDetails = {
        fieldName: 'testRadio',
        fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionC',
        formGroupKeyName: 'testradio',
        fieldDefaultValue: 'NonExistentOption'  // Invalid default value
      };
      // defaultValueIndex will be -1 because 'NonExistentOption' is not in the options
      const defaultValueIndex = radioField.fieldDefaultValue ? component.findOptionIndex(radioField.fieldOptions, 'label', radioField.fieldDefaultValue) : -1;
      // Initialize the form control with null (since the default value doesn't exist)
      component.formGroup[radioField.formGroupKeyName] = new FormControl(
        defaultValueIndex > -1 ? radioField.fieldOptions[defaultValueIndex] : null
      );
      component.filterForm.get('testradio')?.setValue(null); //Set initial value
      component.updateField(radioField, 'radio');
      fixture.detectChanges();
      // Check if the FormControl for 'testradio' is set to null because the default value doesn't exist
      expect(component.filterForm.get('testradio')?.value).toBeNull();
    });
  });
  describe('initializeForm', () => {
    it('should initialize text fields with default values if provided', () => {
      // Initialize filterFieldDetails with a default value
      component.filterFieldDetails.text = [
        { fieldName: 'testText', fieldValue: 'sampleText', formGroupKeyName: 'testtext', fieldDefaultValue: 'defaultText' }
      ];
      // Initialize the form
      component.initializeForm();
      fixture.detectChanges();
      // Test if the form control is initialized with default value
      expect(component.filterForm.get('testtext')?.value).toBe('defaultText');
    });
    it('should initialize text fields with null if no default value is provided', () => {
      component.filterFieldDetails.text = [
        { fieldName: 'testText', fieldValue: 'sampleText', formGroupKeyName: 'testtext' }
      ];
      component.initializeForm();
      fixture.detectChanges();
      // Test if the form control is initialized with null as default
      expect(component.filterForm.get('testtext')?.value).toBeNull();
    });
    it('should initialize text area fields with default values if provided', () => {
      // Initialize filterFieldDetails with a default value
      component.filterFieldDetails.textArea = [
        { fieldName: 'testTextArea', fieldValue: '', formGroupKeyName: 'testtextarea', fieldDefaultValue: 'defaultText' }
      ];
      // Initialize the form
      component.initializeForm();
      fixture.detectChanges();
      // Test if the form control is initialized with default value
      expect(component.filterForm.get('testtextarea')?.value).toBe('defaultText');
    });
    it('should initialize text area fields with null if no default value is provided', () => {
      component.filterFieldDetails.text = [
        { fieldName: 'testTextArea', fieldValue: '', formGroupKeyName: 'testtextarea' }
      ];
      component.initializeForm();
      fixture.detectChanges();
      // Test if the form control is initialized with null as default
      expect(component.filterForm.get('testtextarea')?.value).toBeNull();
    });
    it('should initialize datalist fields with default value if provided', () => {
      component.filterFieldDetails.dataList = [
        {
          fieldName: 'testDatalist', fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }],
          fieldOptionLabelKeyName: 'label', fieldOptionValueKeyName: 'label', fieldValue: 'OptionA', formGroupKeyName: 'testdatalist', fieldDefaultValue: 'OptionA'
        }
      ];
      component.initializeForm();
      fixture.detectChanges();
      // Test if the radio field is initialized with default value
      expect(component.filterForm.get('testdatalist')?.value).toBe('OptionA');
    });
    it('should initialize dropdown fields with default value index', () => {
      component.filterFieldDetails.dropDown = [
        {
          fieldName: 'testDropdown',
          fieldOptions: [{ fdoId: '1', label: 'Option1' }, { fdoId: '2', label: 'Option2' }],
          fieldOptionLabelKeyName: 'label',
          fieldOptionValueKeyName: 'label',
          fieldValue: 'Option1',
          formGroupKeyName: 'testdropdown',
          fieldDefaultValue: 'Option2'
        }
      ];
      component.initializeForm();
      fixture.detectChanges();
      // The default value index should be set for the dropdown field
      expect(component.filterForm.get('testdropdown')?.value).toBe('Option2');
    });
    it('should initialize radio fields with default value if provided', () => {
      component.filterFieldDetails.radio = [
        { fieldName: 'testRadio', fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label', fieldOptionValueKeyName: 'label', fieldValue: 'OptionA', formGroupKeyName: 'testradio', fieldDefaultValue: 'OptionA' }
      ];
      component.initializeForm();
      fixture.detectChanges();
      // Test if the radio field is initialized with default value
      expect(component.filterForm.get('testradio')?.value).toBe('OptionA');
    });
    it('should initialize date range fields with default value if provided', () => {
      component.filterFieldDetails.date = [
        {
          fieldName: 'testDate', fromFieldValue: '2024-01-01', toFieldValue: '2024-01-02', formGroupFromKeyName: 'testdate_from', formGroupToKeyName: 'testdate_to',
          fromFieldDefaultValue: '2024-01-01', toFieldDefaultValue: '2024-01-02'
        }
      ];
      component.initializeForm();
      fixture.detectChanges();
      // Test if the date fields are initialized with default values
      expect(component.filterForm.get('testdate_from')?.value).toBe('2024-01-01');
      expect(component.filterForm.get('testdate_to')?.value).toBe('2024-01-02');
    });
  });
  describe('findOptionIndex', () => {
    it('should return the index of an object in an array based on a key-value match', () => {
      const options = [{ fdoId: 1, label: 'Option1' }, { fdoId: 2, label: 'Option2' }];
      const index = component.findOptionIndex(options, 'label', 'Option2');
      expect(index).toBe(1);
    });
    it('should return -1 if no object is found', () => {
      const options = [{ fdoId: 1, label: 'Option1' }];
      const index = component.findOptionIndex(options, 'label', 'Option3');
      expect(index).toBe(-1);
    });
  });
  describe('applyFilters', () => {
    let filterValues: Record<string, string | number | boolean | null>;
    beforeEach(() => {
      filterValues = {
        testtext: 'sampleText',
        testdatalist: 'OptionA',
        testdropdown: 1, // ID of the selected option
        testradio: 'OptionA',
        testdate_from: '2024-01-01',
        testdate_to: '2024-01-02',
        testcheckbox: false,
        testtextarea: 'test'
      };
      component.filterForm.setValue(filterValues);
    });
    it('should format the "to" date correctly if a value is provided', async () => {
      // Simulate a "to" date field with a valid date string
      filterValues['testdate_to'] = '2024-01-02';
      component.filterForm.setValue(filterValues);
      // Apply filters method to format the date
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      // Check if the "to" date was formatted correctly
      expect(component.filterForm.value.testdate_to).toBe('2024-01-02');
    });
    it('should show an error if date from is required but not provided', () => {
      component.filterForm.get('testdate_from')?.setValue(null);
      filterValues['testdate_from'] = new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0];
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      expect(filterValues['testdate_from']).toBe(new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0]);
    });
    it('should handle both "from" and "to" dates and validate them', async () => {
      // Simulate "from" and "to" dates that are the same
      // Simulate "from" and "to" dates that are the same
      filterValues['testdate_from'] = '2024-01-01';
      filterValues['testdate_to'] = '2024-01-01';
      component.filterForm.setValue(filterValues);
      // Apply filters method
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      // Ensure validation error occurs for same "from" and "to" dates
      expect(snackbarServiceSpy.open).toHaveBeenCalledWith('large', 'error', 'testDate field to Date cannot be the same as from Date.', 'filter', { 'dismissAfter': 5000 });
    });
    it('should show error if "to" date is earlier than "from" date', async () => {
      // Simulate "from" and "to" dates where "to" is earlier than "from"
      filterValues['testdate_from'] = '2024-01-02';
      filterValues['testdate_to'] = '2024-01-01';
      component.filterForm.setValue(filterValues);
      // Apply filters method
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      // Ensure validation error occurs for "to" date being earlier than "from" date
      expect(snackbarServiceSpy.open).toHaveBeenCalledWith('large', 'error', 'testDate field to Date cannot be earlier than From Date.', 'filter', { 'dismissAfter': 5000 });
    });
    it('should correctly format the date range for from and to dates', () => {
      filterValues['testdate_from'] = '2022-01-01';
      filterValues['testdate_to'] = '2022-12-31';
      component.filterForm.setValue(filterValues);
      // Apply the date formatting logic
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      // Verify that the dates are correctly formatted in 'YYYY-MM-DD' format
      expect(filterValues['testdate_from']).toBe('2022-01-01');
      expect(filterValues['testdate_to']).toBe('2022-12-31');
    });
    it('should set the to date as null if it is not provided', () => {
      filterValues['testdate_from'] = '2022-01-01';
      filterValues['testdate_to'] = null;
      component.filterForm.setValue(filterValues);
      component.filterForm.setValue(filterValues);
      // Apply the date formatting logic
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      // Verify that the 'to' date is set to null
      expect(filterValues['testdate_from']).toBe('2022-01-01');
      expect(filterValues['testdate_to']).toBeNull();
    });
    it('should call filterFetch API with the correct filter values', () => {
      // spyOn(component.filterService, 'filterFetch').and.callThrough();
      // spyOn(component.filterService, 'filterFetch').and.callThrough();
      filterValues['testdropdown'] = null;
      // Apply the date formatting logic
      component.filterForm.setValue(filterValues);
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      const testFilterValues = JSON.parse(JSON.stringify(component.filterForm.value));
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      for (const key in testFilterValues) {
        if (testFilterValues[key] === null || testFilterValues[key] === "") {
          delete testFilterValues[key];
        }
      }
      testFilterValues['pageNumber'] = component.filterDetails.pagination.pageNumber;
      testFilterValues['pageSize'] = component.filterDetails.pagination.pageSize;
      // Assert that the filterFetch method was called with the correct values
      expect(component.filterService.filterFetch).toHaveBeenCalledWith('fup/ini/list', testFilterValues);
    });
    it('should call closePopup when API returns data', () => {
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };;
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      // Debugging step: Check if the API call is really being triggered
      spyOn(component, 'closePopup');
      component.applyFilters();
      // Check if filterFetch was actually called
      expect(filterapiServiceSpy.filterFetch).toHaveBeenCalled();
      // Assert: Check if closePopup was called with the correct data
      expect(component.closePopup).toHaveBeenCalledWith(mockResponse);
    });
    it('should show an error message if the filterFetch API call fails', () => {
      const errorResponse = 'Network Error';
      filterapiServiceSpy.filterFetch.and.returnValue(throwError(() => new Error(errorResponse)));
      // spyOn(snackbarServiceSpy, 'open');
      component.applyFilters();
      // Verify that the snackbar shows an error message
      expect(snackbarServiceSpy.open).toHaveBeenCalledWith(
        'large',
        'error',
        `Error: ${errorResponse} Please try again.`,
        'filter',
        { 'dismissAfter': 5000 }
      );
    });
    it('should push the subscription to filterSubscription array', () => {
      spyOn(component.filterSubscription, 'push');
      const mockResponse = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      filterapiServiceSpy.filterFetch.and.returnValue(of(mockResponse));
      component.applyFilters();
      // Verify that the subscription is pushed to the filterSubscription array
      expect(component.filterSubscription.push).toHaveBeenCalled();
    });
    it('should not push subscription to filterSubscription array if filterForm is invalid', () => {
      // Set filter form to invalid
      component.filterForm.setErrors({ invalid: true });
      spyOn(component.filterSubscription, 'push');
      component.applyFilters();
      // Ensure subscription is not pushed if form is invalid
      expect(component.filterSubscription.push).not.toHaveBeenCalled();
    });
  });
  describe('resetFilters', () => {
    it('should reset the filter form and reinitialize the form', () => {
      component.filterForm.get('testtext')?.setValue('initialValue');
      component.resetFilters();
      expect(component.filterForm.value).toEqual({
        testtext: null,
        testdatalist: null,
        testdropdown: null,
        testradio: '',
        testdate_from: null,
        testdate_to: null,
        testcheckbox: null,
        testtextarea: null
      });
    });
  });
  describe('closePopup', () => {
    it('should emit the close event', () => {
      spyOn(component.close, 'emit');
      const testData = {
        status: { responseStatus: 'success', responseCode: '200' },
        body: { content: [{ fdoId: 1, label: 'Option1' }] }
      };
      component.closePopup(testData);
      expect(component.close.emit).toHaveBeenCalled();
    });
  });
  describe('onFieldOptionChange', () => {
    it('should update form control value for dropdown', () => {
      const field: viewDropDownFieldDetails = {
        fieldName: 'testDropDown',
        fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionA',
        formGroupKeyName: 'testdropdown',
        fieldDefaultValue: 'OptionB'  // Default value is OptionB
      };
      const event = 1; // Index for 'Option 1'
      component.onFieldOptionChange('dropDown', event, field);
      expect(component.filterForm.get('testdropdown')?.value).toBe(1); // Option 1 value
    });
    it('should update form control value for datalist', () => {
      const field: viewDropDownFieldDetails = {
        fieldName: 'testDataList',
        fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionA',
        formGroupKeyName: 'testdatalist',
        fieldDefaultValue: 'OptionB'  // Default value is OptionB
      };
      const event = { fdoId: 1, label: "OptionB" }; // Index for 'Option 1'
      component.onFieldOptionChange('dataList', event, field);
      expect(component.filterForm.get('testdatalist')?.value).toBe('OptionB'); // Option 1 value
    });
    it('should update form control value for datalist', () => {
      const field: viewDropDownFieldDetails = {
        fieldName: 'testDataList',
        fieldOptions: [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }], fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionA',
        formGroupKeyName: 'testdatalist',
        fieldDefaultValue: 'OptionB'  // Default value is OptionB
      };
      const event = undefined; // Index for 'Option 1'
      component.onFieldOptionChange('dataList', event, field);
      expect(component.filterForm.get('testdatalist')?.value).toBe(null); // Option 1 value
    });
  });
  describe('onDataListValueChange', () => {
    let mockField: viewDropDownFieldDetails;
    let mockOptions: DropdownOption[];
    beforeEach(() => {
      mockField = {
        fieldName: 'testDataList',
        fieldOptions: [],
        fieldOptionLabelKeyName: 'label',
        fieldOptionValueKeyName: 'label',
        fieldValue: 'OptionA',
        formGroupKeyName: 'testdatalist',
        fieldDefaultValue: 'OptionB'  // Default value is OptionB
      };
      mockOptions = [{ fdoId: '0', label: "OptionA" }, { fdoId: '1', label: "OptionB" }];
    });
    // Test case 1: Should call getFieldOptions when the event is a string with length >= 4
    it('should call getFieldOptions when the event is a string with length >= 4', () => {
      const mockEvent = 'testEvent';
      // Mock the filterService.getFieldOptions method to return mock options
      filterapiServiceSpy.getFieldOptions.and.returnValue(of(mockOptions));
      // Spy on the subscription array to check if the subscription is pushed
      const subscriptionSpy = spyOn(component.filterSubscription, 'push');
      // Call the method
      component.onDataListValueChange(mockEvent, mockField);
      // Expect filterService.getFieldOptions to be called
      expect(filterapiServiceSpy.getFieldOptions).toHaveBeenCalledWith({ userName: mockEvent }, mockField['fieldName']);
      // Expect that fieldOptions has been updated
      expect(mockField.fieldOptions).toEqual(mockOptions);
      // Ensure subscription was added to the array
      expect(subscriptionSpy).toHaveBeenCalled();
    });
    // Test case 2: Should not call getFieldOptions when the event is a string with length < 4
    it('should not call getFieldOptions when the event is a string with length < 4', () => {
      const mockEvent = 'abc'; // length < 4
      // Mock the filterService.getFieldOptions method (though it shouldn't be called)
      filterapiServiceSpy.getFieldOptions.and.stub();
      // Call the method
      component.onDataListValueChange(mockEvent, mockField);
      // Ensure filterService.getFieldOptions is NOT called
      expect(filterapiServiceSpy.getFieldOptions).not.toHaveBeenCalled();
    });
    // Test case 3: Should add the subscription to filterSubscription array
    it('should add the subscription to filterSubscription array', () => {
      const mockEvent = 'validEvent'; // length >= 4
      // Mock the filterService.getFieldOptions method to return mock options
      filterapiServiceSpy.getFieldOptions.and.returnValue(of(mockOptions));
      // Call the method
      component.onDataListValueChange(mockEvent, mockField);
      // Ensure the subscription was pushed to filterSubscription
      expect(component.filterSubscription.length).toBeGreaterThan(0); // should have at least 1 subscription
    });
    // Test case 4: Should update fieldOptions with the returned options
    it('should update fieldOptions with the returned options', () => {
      const mockEvent = 'validEvent'; // length >= 4
      // Mock the filterService.getFieldOptions method to return mock options
      filterapiServiceSpy.getFieldOptions.and.returnValue(of(mockOptions));
      // Call the method
      component.onDataListValueChange(mockEvent, mockField);
      // Verify that fieldOptions were updated with the returned options
      expect(mockField.fieldOptions).toEqual(mockOptions);
    });
  });
  describe('checkedChange', () => {
    it('should update fieldValue and set the form control value when event is true', () => {
      const field: viewCheckBoxFieldDetails = {
        fieldName: 'testCheckBox',
        fieldValue: false,
        formGroupKeyName: 'testcheckbox'
      };
      const event = true;
      component.checkedChange(event, field);
      expect(component.filterForm.get('testcheckbox')?.value).toBe(true);
    });
  });
  describe('clearFilterFields', () => {
    it('should clear a specific field in the form', () => {
      component.filterForm.get('testtext')?.setValue('initialValue');
      component.clearFilterFields('testtext');
      expect(component.filterForm.get('testtext')?.value).toBeNull();
    });
  });
});
