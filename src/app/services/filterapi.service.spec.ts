import { TestBed } from '@angular/core/testing';
import { FilterapiService } from './filterapi.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormatDataPipe } from '../shared/pipe/formatdata.pipe';
import { environment } from '../../environments/environment';
describe('FilterapiService', () => {
  let service: FilterapiService;
  let httpMock: HttpTestingController;
  let formatDataPipeMock: jasmine.SpyObj<FormatDataPipe>;
  beforeEach(() => {
    formatDataPipeMock = jasmine.createSpyObj('FormatDataPipe', ['transform']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FilterapiService,
        { provide: FormatDataPipe, useValue: formatDataPipeMock }
      ]
    });
    service = TestBed.inject(FilterapiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  // Test Case 1: Test `getFieldOptions` with valid data
  it('should return dropdown options when API call is successful', () => {
    const mockRequestPayload = {};
    const mockResponse = {
      status: { timestamp: '123', responseStatus: 'success', responseCode: '200' },
      body: { collectionDataDtoList: [{ fdoId: '1', label: 'Option 1' }, { fdoId: '2', label: 'Option 2' }] }
    };
    // Spy on the transform method to return the correct mock key
    formatDataPipeMock.transform.and.returnValue('country');
    service.getFieldOptions(mockRequestPayload, 'country').subscribe((data) => {
      expect(data).toEqual([{ fdoId: '1', label: 'Option 1' }, { fdoId: '2', label: 'Option 2' }]);
      // expect(service['dropDownOptionSubject'].getValue()['country']).toEqual([{ fdoId: 1, label: 'Option 1' }, { fdoId: 2, label: 'Option 2' }]);
    });
    const req = httpMock.expectOne(`${environment.eclipseURL}common/country`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
  // Test Case 2: Test `getFieldOptions` with invalid response structure
  it('should return an empty array if response structure is invalid', () => {
    const mockRequestPayload = {};
    const mockResponse = { status: { timestamp: '123', responseStatus: 'success', responseCode: '200' }, body: {} };
    formatDataPipeMock.transform.and.returnValue('country');
    service.getFieldOptions(mockRequestPayload, 'country').subscribe((data) => {
      expect(data).toEqual([]);
      expect(service['dropDownOptionSubject'].getValue()).toEqual({});
    });
    const req = httpMock.expectOne(`${environment.eclipseURL}common/country`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
  // Test Case 3: Test `getFieldOptions` with error handling (Fallback to mock data)
  it('should return fallback mock data if the API call fails', () => {
    const mockRequestPayload = {};
    const mockKey: keyof typeof service['mockData'] = 'country';
    // Spy on the transform method to return the correct mock key
    formatDataPipeMock.transform.and.returnValue(mockKey);
    service.getFieldOptions(mockRequestPayload, 'country').subscribe((data) => {
      expect(data).toEqual([{ fdoId: '1', label: 'INDIA' }, { fdoId: '2', label: 'EUROPE' }, { fdoId: '3', label: 'USA' }]);
      expect(service['dropDownOptionSubject'].getValue()['country']).toEqual([{ fdoId: '1', label: 'INDIA' }, { fdoId: '2', label: 'EUROPE' }, { fdoId: '3', label: 'USA' }]);
    });
    const req = httpMock.expectOne(`${environment.eclipseURL}common/country`);
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });
  // Test Case 4: Test `getFieldOptions` with non-200 response code
  it('should handle non-200 response code gracefully', () => {
    const mockRequestPayload = {};
    const mockResponse = {
      status: { timestamp: '123', responseStatus: 'error', responseCode: '500' },
      body: { collectionDataDtoList: [] }
    };
    formatDataPipeMock.transform.and.returnValue('country');
    service.getFieldOptions(mockRequestPayload, 'country').subscribe((data) => {
      expect(data).toEqual([]);
      expect(service['dropDownOptionSubject'].getValue()).toEqual({});
    });
    const req = httpMock.expectOne(`${environment.eclipseURL}common/country`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
  // Test Case 5: Test `getFieldOptions` with data from subject
  it('should return dropdown options from the subject if already populated', () => {
    const mockRequestPayload = {};
    const mockDataFromSubject = [{ fdoId: '0', label: 'Option 1' }, { fdoId: '1', label: 'Option 2' }];
    // Manually populate the dropDownOptionSubject
    service['dropDownOptionSubject'].next({
      country: mockDataFromSubject
    });
    formatDataPipeMock.transform.and.returnValue('country');
    service.getFieldOptions(mockRequestPayload, 'country').subscribe((data) => {
      expect(data).toEqual(mockDataFromSubject); // Expect the data returned to be from the subject
      expect(service['dropDownOptionSubject'].getValue()['country']).toEqual(mockDataFromSubject); // Check the subject is correctly populated
    });
    // Ensure no API call is made, since data should be fetched from the subject
    httpMock.expectNone(`${environment.eclipseURL}common/country`);
  });
  // Test Case 6: should return user dropdown options when API call is successful
  it('should return user dropdown options when API call is successful', () => {
    const mockRequestPayload = { 'userName': 'test' };
    const mockResponse = {
      status: { timestamp: '123', responseStatus: 'success', responseCode: '200' },
      body: { userFilterDetailsDtoList: [{ fdoId: '1', label: 'Option 1' }, { fdoId: '2', label: 'Option 2' }] }
    };
    // Spy on the transform method to return the correct mock key
    formatDataPipeMock.transform.and.returnValue('user');
    service.getFieldOptions(mockRequestPayload, 'user').subscribe((data) => {
      expect(data).toEqual([{ fdoId: '1', label: 'Option 1' }, { fdoId: '2', label: 'Option 2' }]);
      // expect(service['dropDownOptionSubject'].getValue()['country']).toEqual([{ fdoId: 1, label: 'Option 1' }, { fdoId: 2, label: 'Option 2' }]);
    });
    const req = httpMock.expectOne(`${environment.eclipseURL}common/user-filter-details?userName=test`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
  // Test Case 1:should correctly build the query string in the URL
  it('should correctly build the query string in the URL', () => {
    const mockFilterQuery = { filter: 'active' };
    const mockResponse = {
      status: { responseStatus: 'success', responseCode: '200' },
      body: {
        content: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
      }
    };
    service.filterFetch('fup/ini/list', mockFilterQuery).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });
    // Ensure the constructed URL is correct
    const req = httpMock.expectOne(`${environment.eclipseURL}fup/ini/list?filter=active`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse); // Mock the response
  });
  // Test Case 2: should throw an error for unexpected response status or code
  it('should throw an error for unexpected response status or code', () => {
    const mockFilterQuery = { filter: 'active' };
    const mockResponse = {
      status: { responseStatus: 'failure', responseCode: '500' },
      body: {
        content: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
      }
    };
    service.filterFetch('fup/ini/list', mockFilterQuery).subscribe({
      next: () => {
        fail('Unexpected response status or code')
      },
      error: (err) => {
        expect(err.message).toBe('{}');
      }
    });
    // Ensure the constructed URL is correct
    const req = httpMock.expectOne(`${environment.eclipseURL}fup/ini/list?filter=active`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse); // Mock the response
  });
  // Test Case 3:
  it('should throw an error for invalid response structure', () => {
    const mockFilterQuery = { filter: 'active' };
    const mockResponse = {};
    service.filterFetch('fup/ini/list', mockFilterQuery).subscribe({
      next: () => {
        fail('Invalid response structure')
      },
      error: (err) => {
        expect(err.message).toBe('{}');
      }
    });
    // Ensure the constructed URL is correct
    const req = httpMock.expectOne(`${environment.eclipseURL}fup/ini/list?filter=active`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse); // Mock the response
  });
  // Test Case 4: Should handle errors gracefully from catchError and propagate them
  it('should handle errors gracefully from catchError and propagate them', () => {
    const mockFilterQuery = { filter: 'inactive' };
    const mockResponse = {
      status: {
        errors: [{ message: "Some error occurred" }]
      }
    };
    const errorMessage = new Error(JSON.stringify(mockResponse['status']['errors'][0]['message']))
    service.filterFetch('fup/ini/list', mockFilterQuery).subscribe({
      next: () => {
        fail('Expected error, but got data');
      },
      error: (err) => {
        // Ensure that the error is transformed into a JSON string
        expect(err).toEqual(errorMessage);
      }
    });
    const req = httpMock.expectOne(`${environment.eclipseURL}fup/ini/list?filter=inactive`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse, { status: 500, statusText: 'Server Error' }); // Mock server error response
  });
});
